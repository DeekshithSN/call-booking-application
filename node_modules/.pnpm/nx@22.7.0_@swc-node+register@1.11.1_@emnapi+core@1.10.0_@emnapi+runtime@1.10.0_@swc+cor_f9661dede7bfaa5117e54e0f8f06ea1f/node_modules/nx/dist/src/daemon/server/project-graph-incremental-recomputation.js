"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentSourceMaps = exports.currentProjectGraph = exports.currentProjectFileMapCache = exports.fileMapWithFiles = void 0;
exports.getCachedSerializedProjectGraphPromise = getCachedSerializedProjectGraphPromise;
exports.addUpdatedAndDeletedFiles = addUpdatedAndDeletedFiles;
exports.registerProjectGraphRecomputationListener = registerProjectGraphRecomputationListener;
exports.invalidateGraphCache = invalidateGraphCache;
const perf_hooks_1 = require("perf_hooks");
const nx_json_1 = require("../../config/nx-json");
const file_hasher_1 = require("../../hasher/file-hasher");
const build_project_graph_1 = require("../../project-graph/build-project-graph");
const error_types_1 = require("../../project-graph/error-types");
const file_map_utils_1 = require("../../project-graph/file-map-utils");
const nx_deps_cache_1 = require("../../project-graph/nx-deps-cache");
const get_plugins_1 = require("../../project-graph/plugins/get-plugins");
const retrieve_workspace_files_1 = require("../../project-graph/utils/retrieve-workspace-files");
const fileutils_1 = require("../../utils/fileutils");
const workspace_context_1 = require("../../utils/workspace-context");
const workspace_root_1 = require("../../utils/workspace-root");
const logger_1 = require("../logger");
const progress_topics_1 = require("../../utils/progress-topics");
const client_socket_context_1 = require("./client-socket-context");
const file_change_events_1 = require("./file-watching/file-change-events");
const file_watcher_sockets_1 = require("./file-watching/file-watcher-sockets");
const project_graph_listener_sockets_1 = require("./project-graph-listener-sockets");
let cachedSerializedProjectGraphPromise;
// Maps file path to a version counter that increments on each modification.
// This lets us detect mid-flight re-modifications when clearing processed files.
const collectedUpdatedFiles = new Map();
const collectedDeletedFiles = new Map();
const projectGraphRecomputationListeners = new Set();
let storedWorkspaceConfigHash;
let waitPeriod = 100;
let scheduledTimeoutId;
let knownExternalNodes = {};
let fileChangeCounter = 0;
let recomputationGeneration = 0;
async function getCachedSerializedProjectGraphPromise(socket) {
    // Subscribe the requesting client to the graph-construction topic
    // for the duration of the await, so in-flight progress/log messages
    // — including those produced by a recomputation that was already
    // started before this caller arrived — are broadcast to them.
    if (socket) {
        (0, client_socket_context_1.subscribeClientToTopic)(socket, progress_topics_1.ProgressTopics.GraphConstruction);
    }
    try {
        let wasScheduled = false;
        // recomputing it now on demand. we can ignore the scheduled timeout
        if (scheduledTimeoutId) {
            wasScheduled = true;
            clearTimeout(scheduledTimeoutId);
            scheduledTimeoutId = undefined;
        }
        // reset the wait time
        waitPeriod = 100;
        await resetInternalStateIfNxDepsMissing();
        const plugins = await (0, get_plugins_1.getPlugins)();
        const previousPromise = cachedSerializedProjectGraphPromise;
        if (collectedUpdatedFiles.size == 0 && collectedDeletedFiles.size == 0) {
            if (!cachedSerializedProjectGraphPromise) {
                cachedSerializedProjectGraphPromise =
                    processFilesAndCreateAndSerializeProjectGraph(plugins);
                logger_1.serverLogger.log('No files changed, but no in-memory cached project graph found. Recomputing it...');
            }
            else {
                logger_1.serverLogger.log('Reusing in-memory cached project graph because no files changed.');
            }
        }
        else {
            logger_1.serverLogger.log(`Recomputing project graph because of ${collectedUpdatedFiles.size} updated and ${collectedDeletedFiles.size} deleted files.`);
            cachedSerializedProjectGraphPromise =
                processFilesAndCreateAndSerializeProjectGraph(plugins);
        }
        const graphWasRecomputed = cachedSerializedProjectGraphPromise !== previousPromise;
        const result = await cachedSerializedProjectGraphPromise;
        if (wasScheduled) {
            notifyProjectGraphRecomputationListeners(result.projectGraph, result.sourceMaps, result.error);
        }
        const errors = result.error
            ? result.error instanceof error_types_1.DaemonProjectGraphError
                ? result.error.errors
                : [result.error]
            : [];
        // Write the daemon's current graph to disk to ensure disk cache stays
        // in sync with the daemon's in-memory cache. This prevents issues where
        // a non-daemon process writes a stale/errored cache that never gets
        // overwritten by the daemon's valid graph.
        //
        // When the graph was just recomputed, always write so the new graph is
        // persisted. When serving the same graph from memory, use
        // writeCacheIfStale to skip the write unless an external process has
        // modified the file since this process last wrote it.
        if (result.projectGraph &&
            result.projectFileMapCache &&
            result.sourceMaps) {
            const writeFn = graphWasRecomputed ? nx_deps_cache_1.writeCache : nx_deps_cache_1.writeCacheIfStale;
            writeFn(result.projectFileMapCache, result.projectGraph, result.sourceMaps, errors);
        }
        if (errors?.length) {
            cachedSerializedProjectGraphPromise = null;
        }
        return result;
    }
    catch (e) {
        // We return the project graph, but we don't want to persist the cache to
        // serve the same state, as it could cause issues if the error is caused by something
        // transient
        cachedSerializedProjectGraphPromise = null;
        return {
            error: e,
            serializedProjectGraph: null,
            serializedSourceMaps: null,
            sourceMaps: null,
            projectGraph: null,
            projectFileMapCache: null,
            fileMap: null,
            allWorkspaceFiles: null,
            rustReferences: null,
        };
    }
    finally {
        if (socket) {
            (0, client_socket_context_1.unsubscribeClientFromTopic)(socket, progress_topics_1.ProgressTopics.GraphConstruction);
        }
    }
}
function addUpdatedAndDeletedFiles(createdFiles, updatedFiles, deletedFiles) {
    ++fileChangeCounter;
    for (let f of [...createdFiles, ...updatedFiles]) {
        collectedDeletedFiles.delete(f);
        collectedUpdatedFiles.set(f, fileChangeCounter);
    }
    for (let f of deletedFiles) {
        collectedUpdatedFiles.delete(f);
        collectedDeletedFiles.set(f, fileChangeCounter);
    }
    // Notify file change listeners immediately when files change
    if (createdFiles.length > 0 ||
        updatedFiles.length > 0 ||
        deletedFiles.length > 0) {
        (0, file_change_events_1.notifyFileChangeListeners)({ createdFiles, updatedFiles, deletedFiles });
    }
    if (updatedFiles.length > 0 || deletedFiles.length > 0) {
        (0, file_watcher_sockets_1.notifyFileWatcherSockets)(null, updatedFiles, deletedFiles);
    }
    if (createdFiles.length > 0) {
        waitPeriod = 100; // reset it to process the graph faster
    }
    if (!scheduledTimeoutId) {
        scheduledTimeoutId = setTimeout(async () => {
            scheduledTimeoutId = undefined;
            if (waitPeriod < 4000) {
                waitPeriod = waitPeriod * 2;
            }
            cachedSerializedProjectGraphPromise =
                processFilesAndCreateAndSerializeProjectGraph(await (0, get_plugins_1.getPlugins)());
            const { projectGraph, sourceMaps, error } = await cachedSerializedProjectGraphPromise;
            if (createdFiles.length > 0) {
                (0, file_watcher_sockets_1.notifyFileWatcherSockets)(createdFiles, null, null);
            }
            notifyProjectGraphRecomputationListeners(projectGraph, sourceMaps, error);
        }, waitPeriod);
    }
}
function registerProjectGraphRecomputationListener(listener) {
    projectGraphRecomputationListeners.add(listener);
}
function computeWorkspaceConfigHash(projectsConfigurations) {
    const projectConfigurationStrings = Object.entries(projectsConfigurations)
        .sort(([projectNameA], [projectNameB]) => projectNameA.localeCompare(projectNameB))
        .map(([projectName, projectConfig]) => `${projectName}:${JSON.stringify(projectConfig)}`);
    return (0, file_hasher_1.hashArray)(projectConfigurationStrings);
}
async function processCollectedUpdatedAndDeletedFiles({ projects, externalNodes, projectRootMap }, updatedFileHashes, deletedFiles) {
    try {
        const workspaceConfigHash = computeWorkspaceConfigHash(projects);
        // when workspace config changes we cannot incrementally update project file map
        if (workspaceConfigHash !== storedWorkspaceConfigHash) {
            storedWorkspaceConfigHash = workspaceConfigHash;
            ({ ...exports.fileMapWithFiles } = await (0, retrieve_workspace_files_1.retrieveWorkspaceFiles)(workspace_root_1.workspaceRoot, projectRootMap));
            knownExternalNodes = externalNodes;
        }
        else {
            if (exports.fileMapWithFiles) {
                exports.fileMapWithFiles = (0, file_map_utils_1.updateFileMap)(projects, exports.fileMapWithFiles.rustReferences, updatedFileHashes, deletedFiles);
            }
            else {
                exports.fileMapWithFiles = await (0, retrieve_workspace_files_1.retrieveWorkspaceFiles)(workspace_root_1.workspaceRoot, projectRootMap);
            }
        }
    }
    catch (e) {
        // this is expected
        // for instance, project.json can be incorrect or a file we are trying to has
        // has been deleted
        // we are resetting internal state to start from scratch next time a file changes
        // given the user the opportunity to fix the error
        // if Nx requests the project graph prior to the error being fixed,
        // the error will be propagated
        logger_1.serverLogger.log(`Error detected when recomputing project file map: ${e.message}`);
        resetInternalState();
        throw e;
    }
}
function invalidateGraphCache() {
    // Clear the cached promise so the next request triggers a fresh computation.
    // We intentionally do NOT call getCachedSerializedProjectGraphPromise() here
    // because assigning its return Promise to the module-level variable causes a
    // deadlock: the async function resumes, sees the variable is non-null (pointing
    // at its own Promise), takes the "reuse" branch, and awaits itself forever.
    cachedSerializedProjectGraphPromise = null;
}
async function processFilesAndCreateAndSerializeProjectGraph(plugins) {
    const myGeneration = ++recomputationGeneration;
    // Helper to check if this recomputation is stale (a newer one has started)
    const isStale = () => myGeneration !== recomputationGeneration;
    try {
        perf_hooks_1.performance.mark('hash-watched-changes-start');
        const updatedFilesSnapshot = new Map(collectedUpdatedFiles);
        const deletedFilesSnapshot = new Map(collectedDeletedFiles);
        const updatedFiles = [...updatedFilesSnapshot.keys()];
        const deletedFiles = [...deletedFilesSnapshot.keys()];
        let updatedFileHashes = (0, workspace_context_1.updateFilesInContext)(workspace_root_1.workspaceRoot, updatedFiles, deletedFiles);
        perf_hooks_1.performance.mark('hash-watched-changes-end');
        perf_hooks_1.performance.measure('hash changed files from watcher', 'hash-watched-changes-start', 'hash-watched-changes-end');
        logger_1.serverLogger.requestLog(`Updated workspace context based on watched changes, recomputing project graph...`);
        logger_1.serverLogger.requestLog(updatedFiles);
        logger_1.serverLogger.requestLog(deletedFiles);
        const nxJson = (0, nx_json_1.readNxJson)(workspace_root_1.workspaceRoot);
        global.NX_GRAPH_CREATION = true;
        let projectConfigurationsResult;
        let projectConfigurationsError;
        try {
            projectConfigurationsResult = await (0, retrieve_workspace_files_1.retrieveProjectConfigurations)(plugins, workspace_root_1.workspaceRoot, nxJson);
        }
        catch (e) {
            if (e instanceof error_types_1.ProjectConfigurationsError) {
                projectConfigurationsResult = e.partialProjectConfigurationsResult;
                projectConfigurationsError = e;
            }
            else {
                throw e;
            }
        }
        // Early exit if a newer recomputation has started - chain to the newer one
        if (isStale()) {
            notifyPluginsGraphAborted(plugins);
            return cachedSerializedProjectGraphPromise;
        }
        await processCollectedUpdatedAndDeletedFiles(projectConfigurationsResult, updatedFileHashes, deletedFiles);
        // Only remove files whose version matches the snapshot — if the version
        // is higher, the file was modified again mid-flight and needs reprocessing.
        for (const [f, version] of updatedFilesSnapshot) {
            if (collectedUpdatedFiles.get(f) === version) {
                collectedUpdatedFiles.delete(f);
            }
        }
        for (const [f, version] of deletedFilesSnapshot) {
            if (collectedDeletedFiles.get(f) === version) {
                collectedDeletedFiles.delete(f);
            }
        }
        // Early exit if a newer recomputation has started - chain to the newer one
        if (isStale()) {
            notifyPluginsGraphAborted(plugins);
            return cachedSerializedProjectGraphPromise;
        }
        const g = await createAndSerializeProjectGraph(projectConfigurationsResult);
        delete global.NX_GRAPH_CREATION;
        const errors = [...(projectConfigurationsError?.errors ?? [])];
        if (g.error) {
            if ((0, error_types_1.isAggregateProjectGraphError)(g.error) && g.error.errors?.length) {
                errors.push(...g.error.errors);
            }
            else {
                return {
                    error: g.error,
                    projectGraph: null,
                    projectFileMapCache: null,
                    fileMap: null,
                    rustReferences: null,
                    allWorkspaceFiles: null,
                    serializedProjectGraph: null,
                    serializedSourceMaps: null,
                    sourceMaps: null,
                };
            }
        }
        if (errors.length > 0) {
            return {
                error: new error_types_1.DaemonProjectGraphError(errors, g.projectGraph, projectConfigurationsResult.sourceMaps),
                projectGraph: null,
                projectFileMapCache: null,
                fileMap: null,
                rustReferences: null,
                allWorkspaceFiles: null,
                serializedProjectGraph: null,
                serializedSourceMaps: null,
                sourceMaps: null,
            };
        }
        else {
            return g;
        }
    }
    catch (err) {
        return {
            error: err,
            projectGraph: null,
            projectFileMapCache: null,
            fileMap: null,
            rustReferences: null,
            allWorkspaceFiles: null,
            serializedProjectGraph: null,
            serializedSourceMaps: null,
            sourceMaps: null,
        };
    }
}
function copyFileData(d) {
    return d.map((t) => ({ ...t }));
}
function copyFileMap(m) {
    const c = {
        nonProjectFiles: copyFileData(m.nonProjectFiles),
        projectFileMap: {},
    };
    for (let p of Object.keys(m.projectFileMap)) {
        c.projectFileMap[p] = copyFileData(m.projectFileMap[p]);
    }
    return c;
}
async function createAndSerializeProjectGraph({ projects, sourceMaps, }) {
    try {
        perf_hooks_1.performance.mark('create-project-graph-start');
        const fileMap = copyFileMap(exports.fileMapWithFiles.fileMap);
        const allWorkspaceFiles = copyFileData(exports.fileMapWithFiles.allWorkspaceFiles);
        const rustReferences = exports.fileMapWithFiles.rustReferences;
        const { projectGraph, projectFileMapCache } = await (0, build_project_graph_1.buildProjectGraphUsingProjectFileMap)(projects, knownExternalNodes, fileMap, allWorkspaceFiles, rustReferences, exports.currentProjectFileMapCache || (0, nx_deps_cache_1.readFileMapCache)(), await (0, get_plugins_1.getPlugins)(), sourceMaps);
        exports.currentProjectFileMapCache = projectFileMapCache;
        exports.currentProjectGraph = projectGraph;
        exports.currentSourceMaps = sourceMaps;
        perf_hooks_1.performance.mark('create-project-graph-end');
        perf_hooks_1.performance.measure('total execution time for createProjectGraph()', 'create-project-graph-start', 'create-project-graph-end');
        perf_hooks_1.performance.mark('json-stringify-start');
        const serializedProjectGraph = JSON.stringify(projectGraph);
        const serializedSourceMaps = JSON.stringify(sourceMaps);
        perf_hooks_1.performance.mark('json-stringify-end');
        perf_hooks_1.performance.measure('serialize graph', 'json-stringify-start', 'json-stringify-end');
        return {
            error: null,
            projectGraph,
            projectFileMapCache,
            fileMap,
            allWorkspaceFiles,
            serializedProjectGraph,
            serializedSourceMaps,
            sourceMaps,
            rustReferences,
        };
    }
    catch (e) {
        logger_1.serverLogger.log(`Error detected when creating a project graph: ${e.message}`);
        return {
            error: e,
            projectGraph: null,
            projectFileMapCache: null,
            fileMap: null,
            allWorkspaceFiles: null,
            serializedProjectGraph: null,
            serializedSourceMaps: null,
            sourceMaps: null,
            rustReferences: null,
        };
    }
}
async function resetInternalState() {
    cachedSerializedProjectGraphPromise = undefined;
    exports.fileMapWithFiles = undefined;
    exports.currentProjectFileMapCache = undefined;
    exports.currentProjectGraph = undefined;
    exports.currentSourceMaps = undefined;
    collectedUpdatedFiles.clear();
    collectedDeletedFiles.clear();
    (0, workspace_context_1.resetWorkspaceContext)();
    waitPeriod = 100;
}
async function resetInternalStateIfNxDepsMissing() {
    try {
        if (!(0, fileutils_1.fileExists)(nx_deps_cache_1.nxProjectGraph) && cachedSerializedProjectGraphPromise) {
            await resetInternalState();
        }
    }
    catch (e) {
        await resetInternalState();
    }
}
function notifyPluginsGraphAborted(plugins) {
    // At both abort sites, only createNodes has been called.
    // createDependencies and createMetadata are called later in
    // createAndSerializeProjectGraph, which hasn't run yet.
    for (const plugin of plugins) {
        plugin.notifyPhaseAborted?.('graph', 'createNodes');
    }
}
function notifyProjectGraphRecomputationListeners(projectGraph, sourceMaps, error) {
    for (const listener of projectGraphRecomputationListeners) {
        listener(projectGraph, sourceMaps, error);
    }
    (0, project_graph_listener_sockets_1.notifyProjectGraphListenerSockets)(projectGraph, sourceMaps, error);
}
