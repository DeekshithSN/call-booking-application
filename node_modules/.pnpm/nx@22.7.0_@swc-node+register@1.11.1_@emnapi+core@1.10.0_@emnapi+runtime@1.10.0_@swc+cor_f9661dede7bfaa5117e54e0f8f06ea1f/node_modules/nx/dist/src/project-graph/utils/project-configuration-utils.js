"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTargetDefaultsForTarget = exports.mergeTargetConfigurations = void 0;
exports.createProjectConfigurationsWithPlugins = createProjectConfigurationsWithPlugins;
exports.mergeCreateNodesResults = mergeCreateNodesResults;
exports.findMatchingConfigFiles = findMatchingConfigFiles;
const workspace_root_1 = require("../../utils/workspace-root");
const project_nodes_manager_1 = require("./project-configuration/project-nodes-manager");
const target_normalization_1 = require("./project-configuration/target-normalization");
const minimatch_1 = require("minimatch");
const perf_hooks_1 = require("perf_hooks");
const delayed_spinner_1 = require("../../utils/delayed-spinner");
const plugin_progress_text_1 = require("../../utils/plugin-progress-text");
const progress_topics_1 = require("../../utils/progress-topics");
const error_types_1 = require("../error-types");
var target_merging_1 = require("./project-configuration/target-merging");
Object.defineProperty(exports, "mergeTargetConfigurations", { enumerable: true, get: function () { return target_merging_1.mergeTargetConfigurations; } });
Object.defineProperty(exports, "readTargetDefaultsForTarget", { enumerable: true, get: function () { return target_merging_1.readTargetDefaultsForTarget; } });
/**
 * Transforms a list of project paths into a map of project configurations.
 *
 * @param root The workspace root
 * @param nxJson The NxJson configuration
 * @param workspaceFiles A list of non-ignored workspace files
 * @param plugins The plugins that should be used to infer project configuration
 */
async function createProjectConfigurationsWithPlugins(root = workspace_root_1.workspaceRoot, nxJson, projectFiles, // making this parameter allows devkit to pick up newly created projects
plugins) {
    perf_hooks_1.performance.mark('build-project-configs:start');
    let spinner;
    const inProgressPlugins = new Set();
    const getSpinnerText = () => spinner
        ? (0, plugin_progress_text_1.formatPluginProgressText)('Creating project graph nodes', inProgressPlugins)
        : '';
    const createNodesPlugins = plugins.filter((plugin) => plugin.createNodes?.[0]);
    spinner = new delayed_spinner_1.DelayedSpinner(getSpinnerText(), {
        progressTopic: progress_topics_1.ProgressTopics.GraphConstruction,
    });
    const results = [];
    const errors = [];
    // We iterate over plugins first - this ensures that plugins specified first take precedence.
    for (const [index, { index: pluginIndex, createNodes: createNodesTuple, include, exclude, name: pluginName, },] of createNodesPlugins.entries()) {
        const [pattern, createNodes] = createNodesTuple;
        const matchingConfigFiles = findMatchingConfigFiles(projectFiles[index], pattern, include, exclude);
        inProgressPlugins.add(pluginName);
        let r = createNodes(matchingConfigFiles, {
            nxJsonConfiguration: nxJson,
            workspaceRoot: root,
        })
            .catch((e) => {
            const error = (0, error_types_1.isAggregateCreateNodesError)(e)
                ? // This is an expected error if something goes wrong while processing files.
                    e
                : // This represents a single plugin erroring out with a hard error.
                    new error_types_1.AggregateCreateNodesError([[null, e]], []);
            if (pluginIndex !== undefined) {
                error.pluginIndex = pluginIndex;
            }
            (0, error_types_1.formatAggregateCreateNodesError)(error, pluginName);
            // This represents a single plugin erroring out with a hard error.
            errors.push(error);
            // The plugin didn't return partial results, so we return an empty array.
            return error.partialResults.map((r) => [pluginName, r[0], r[1], index]);
        })
            .finally(() => {
            inProgressPlugins.delete(pluginName);
            spinner.setMessage(getSpinnerText());
        });
        results.push(r);
    }
    return Promise.all(results).then((results) => {
        spinner?.cleanup();
        const { projectRootMap, externalNodes, rootMap, configurationSourceMaps } = mergeCreateNodesResults(results, nxJson, root, errors);
        perf_hooks_1.performance.mark('build-project-configs:end');
        perf_hooks_1.performance.measure('build-project-configs', 'build-project-configs:start', 'build-project-configs:end');
        if (errors.length === 0) {
            return {
                projects: projectRootMap,
                externalNodes,
                projectRootMap: rootMap,
                sourceMaps: configurationSourceMaps,
                matchingProjectFiles: projectFiles.flat(),
            };
        }
        else {
            throw new error_types_1.ProjectConfigurationsError(errors, {
                projects: projectRootMap,
                externalNodes,
                projectRootMap: rootMap,
                sourceMaps: configurationSourceMaps,
                matchingProjectFiles: projectFiles.flat(),
            });
        }
    });
}
function mergeCreateNodesResults(results, nxJsonConfiguration, workspaceRoot, errors) {
    perf_hooks_1.performance.mark('createNodes:merge - start');
    const nodesManager = new project_nodes_manager_1.ProjectNodesManager();
    const externalNodes = {};
    const configurationSourceMaps = {};
    // Process each plugin's results in two phases:
    //   Phase 1: Merge all projects from this plugin into rootMap/nameMap
    //   Phase 2: Register substitutors for this plugin's results
    //
    // Per-plugin batching ensures that:
    //  - All same-plugin projects are in the nameMap before substitutor
    //    registration (fixes cross-file references like kafka-stream)
    //  - Later-plugin renames haven't occurred yet, so dependsOn strings
    //    that reference old names can still be resolved via the nameMap
    for (const pluginResults of results) {
        // Phase 1: Merge all projects from this plugin batch
        for (const result of pluginResults) {
            const [pluginName, file, nodes, pluginIndex] = result;
            const { projects: projectNodes, externalNodes: pluginExternalNodes } = nodes;
            const sourceInfo = [file, pluginName];
            for (const root in projectNodes) {
                // Handles `{projects: {'libs/foo': undefined}}`.
                if (!projectNodes[root]) {
                    continue;
                }
                const project = {
                    root: root,
                    ...projectNodes[root],
                };
                try {
                    nodesManager.mergeProjectNode(project, configurationSourceMaps, sourceInfo);
                }
                catch (error) {
                    errors.push(new error_types_1.MergeNodesError({
                        file,
                        pluginName,
                        error,
                        pluginIndex,
                    }));
                }
            }
            Object.assign(externalNodes, pluginExternalNodes);
        }
        // Phase 2: Register substitutors for this plugin batch. The nameMap
        // now contains all projects from this plugin (and all prior plugins)
        // so splitTargetFromConfigurations can resolve colon-delimited strings.
        for (const result of pluginResults) {
            const [pluginName, file, nodes, pluginIndex] = result;
            const { projects: projectNodes } = nodes;
            try {
                nodesManager.registerSubstitutors(projectNodes);
            }
            catch (error) {
                errors.push(new error_types_1.MergeNodesError({
                    file,
                    pluginName,
                    error,
                    pluginIndex,
                }));
            }
        }
    }
    const projectRootMap = nodesManager.getRootMap();
    try {
        nodesManager.applySubstitutions();
        (0, target_normalization_1.validateAndNormalizeProjectRootMap)(workspaceRoot, projectRootMap, nxJsonConfiguration, configurationSourceMaps);
    }
    catch (error) {
        let _errors = error instanceof AggregateError ? error.errors : [error];
        for (const e of _errors) {
            if ((0, error_types_1.isProjectsWithNoNameError)(e) ||
                (0, error_types_1.isMultipleProjectsWithSameNameError)(e) ||
                (0, error_types_1.isWorkspaceValidityError)(e)) {
                errors.push(e);
            }
            else {
                throw e;
            }
        }
    }
    const rootMap = (0, project_nodes_manager_1.createRootMap)(projectRootMap);
    perf_hooks_1.performance.mark('createNodes:merge - end');
    perf_hooks_1.performance.measure('createNodes:merge', 'createNodes:merge - start', 'createNodes:merge - end');
    return { projectRootMap, externalNodes, rootMap, configurationSourceMaps };
}
/**
 * Fast matcher for patterns without negations - uses short-circuit evaluation.
 */
function matchesSimplePatterns(file, patterns) {
    return patterns.some((pattern) => (0, minimatch_1.minimatch)(file, pattern, { dot: true }));
}
/**
 * Full matcher for patterns with negations - processes all patterns sequentially.
 * Patterns starting with '!' are negation patterns that remove files from the match set.
 * Patterns are processed in order, with later patterns overriding earlier ones.
 */
function matchesNegationPatterns(file, patterns) {
    // If first pattern is negation, start by matching everything
    let isMatch = patterns[0].startsWith('!');
    for (const pattern of patterns) {
        const isNegation = pattern.startsWith('!');
        const actualPattern = isNegation ? pattern.substring(1) : pattern;
        if ((0, minimatch_1.minimatch)(file, actualPattern, { dot: true })) {
            // Last matching pattern wins
            isMatch = !isNegation;
        }
    }
    return isMatch;
}
/**
 * Creates a matcher function for the given patterns.
 * @param patterns Array of glob patterns (can include negation patterns starting with '!')
 * @param emptyValue Value to return when patterns array is empty
 * @returns A function that checks if a file matches the patterns
 */
function createMatcher(patterns, emptyValue) {
    if (!patterns || patterns.length === 0) {
        return () => emptyValue;
    }
    const hasNegationPattern = patterns.some((p) => p.startsWith('!'));
    return hasNegationPattern
        ? (file) => matchesNegationPatterns(file, patterns)
        : (file) => matchesSimplePatterns(file, patterns);
}
function findMatchingConfigFiles(projectFiles, pattern, include, exclude) {
    const matchingConfigFiles = [];
    // Create matchers once, outside the loop
    // Empty include means include everything, empty exclude means exclude nothing
    const includes = createMatcher(include, true);
    const excludes = createMatcher(exclude, false);
    for (const file of projectFiles) {
        if ((0, minimatch_1.minimatch)(file, pattern, { dot: true })) {
            if (!includes(file)) {
                continue;
            }
            if (excludes(file)) {
                continue;
            }
            matchingConfigFiles.push(file);
        }
    }
    return matchingConfigFiles;
}
