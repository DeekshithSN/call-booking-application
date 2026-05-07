"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildTargetNameFromMFDevServer = getBuildTargetNameFromMFDevServer;
exports.getRemotes = getRemotes;
exports.getModuleFederationConfig = getModuleFederationConfig;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/src/internal");
const find_matching_projects_1 = require("nx/src/utils/find-matching-projects");
const pc = tslib_1.__importStar(require("picocolors"));
const path_1 = require("path");
const fs_1 = require("fs");
function extractRemoteProjectsFromConfig(config, pathToManifestFile) {
    const remotes = [];
    const dynamicRemotes = [];
    if (pathToManifestFile && (0, fs_1.existsSync)(pathToManifestFile)) {
        const moduleFederationManifestJson = (0, fs_1.readFileSync)(pathToManifestFile, 'utf-8');
        if (moduleFederationManifestJson) {
            /**
             *
             * This should have shape of
             * {
             *   "remoteName": "remoteLocation",
             * }
             * But users might have their own, enforce only that the key is the remote name
             */
            const parsedManifest = JSON.parse(moduleFederationManifestJson);
            // Get keys once instead of calling Object.keys twice
            const manifestKeys = Object.keys(parsedManifest);
            if (manifestKeys.every((key) => typeof key === 'string')) {
                dynamicRemotes.push(...manifestKeys);
            }
        }
    }
    const staticRemotes = config.remotes?.map((r) => (Array.isArray(r) ? r[0] : r)) ?? [];
    remotes.push(...staticRemotes);
    return { remotes, dynamicRemotes };
}
// Find the target that uses the module-federation-dev-server executor
function getBuildTargetNameFromMFDevServer(projectConfig, projectGraph) {
    if (projectConfig.targets) {
        for (const [targetKey, targetConfig] of Object.entries(projectConfig.targets)) {
            const executor = targetConfig.executor || '';
            // Extract the portion after the `:` in the executor name
            const executorParts = executor.split(':');
            const executorName = executorParts.length > 1 ? executorParts[1] : executor;
            if (executorName === 'module-federation-dev-server') {
                // Extract the buildTarget from the options
                if (targetConfig.options?.buildTarget) {
                    const parsedTarget = (0, devkit_1.parseTargetString)(targetConfig.options.buildTarget, projectGraph);
                    return parsedTarget.target;
                }
            }
        }
    }
    return 'build';
}
function collectRemoteProjects(remote, collected, context) {
    const remoteProject = context.projectGraph.nodes[remote]?.data;
    if (!context.projectGraph.nodes[remote] || collected.has(remote)) {
        return;
    }
    collected.add(remote);
    const remoteProjectRoot = remoteProject.root;
    const buildTargetName = getBuildTargetNameFromMFDevServer(remoteProject, context.projectGraph);
    let remoteProjectTsConfig = remoteProject.targets?.[buildTargetName]?.options?.tsConfig;
    const remoteProjectConfig = getModuleFederationConfig(remoteProjectTsConfig, context.root, remoteProjectRoot);
    const { remotes: remoteProjectRemotes } = extractRemoteProjectsFromConfig(remoteProjectConfig);
    remoteProjectRemotes.forEach((r) => collectRemoteProjects(r, collected, context));
}
function getRemotes(devRemotes, skipRemotes, config, context, pathToManifestFile) {
    const collectedRemotes = new Set();
    const { remotes, dynamicRemotes } = extractRemoteProjectsFromConfig(config, pathToManifestFile);
    remotes.forEach((r) => collectRemoteProjects(r, collectedRemotes, context));
    const remotesToSkip = new Set((0, find_matching_projects_1.findMatchingProjects)(skipRemotes, context.projectGraph.nodes) ?? []);
    if (remotesToSkip.size > 0) {
        devkit_1.logger.info(`Remotes not served automatically: ${[...remotesToSkip.values()].join(', ')}`);
    }
    const knownRemotes = Array.from(collectedRemotes).filter((r) => !remotesToSkip.has(r));
    // With dynamic remotes, the manifest file may contain the names with `_` due to MF limitations on naming
    // The project graph might contain these names with `-` rather than `_`. Check for both.
    // This can occur after migration of existing remotes past Nx 19.8
    const normalizedDynamicRemotes = dynamicRemotes.map((r) => {
        // Compute replacement once instead of twice
        const normalizedName = r.replace(/_/g, '-');
        return context.projectGraph.nodes[normalizedName] ? normalizedName : r;
    });
    const knownDynamicRemotes = normalizedDynamicRemotes.filter((r) => !remotesToSkip.has(r) && context.projectGraph.nodes[r]);
    devkit_1.logger.info(`NX Starting module federation dev-server for ${pc.bold(context.projectName)} with ${[...knownRemotes, ...knownDynamicRemotes].length} remotes`);
    // Normalize devRemotes to array and call findMatchingProjects once
    const devServeApps = new Set(!devRemotes
        ? []
        : (0, find_matching_projects_1.findMatchingProjects)(Array.isArray(devRemotes) ? devRemotes : [devRemotes], context.projectGraph.nodes));
    const staticRemotes = knownRemotes.filter((r) => !devServeApps.has(r));
    const devServeRemotes = [...knownRemotes, ...knownDynamicRemotes].filter((r) => devServeApps.has(r));
    const staticDynamicRemotes = knownDynamicRemotes.filter((r) => !devServeApps.has(r));
    // Helper to get port from remote project
    const getRemotePort = (r) => context.projectGraph.nodes[r].data.targets['serve'].options.port;
    // Collect ports for dev-served remotes (used in return value)
    const remotePorts = [...devServeRemotes, ...staticDynamicRemotes].map(getRemotePort);
    // Calculate max port in a single pass instead of creating intermediate arrays
    let maxPort = -Infinity;
    for (const port of remotePorts) {
        if (port > maxPort)
            maxPort = port;
    }
    for (const r of staticRemotes) {
        const port = getRemotePort(r);
        if (port > maxPort)
            maxPort = port;
    }
    const staticRemotePort = staticRemotes.length === 0 && remotePorts.length === 0
        ? undefined
        : maxPort + (remotesToSkip.size + 1);
    return {
        staticRemotes,
        devRemotes: devServeRemotes,
        dynamicRemotes: staticDynamicRemotes,
        remotePorts,
        staticRemotePort,
    };
}
function getModuleFederationConfig(tsconfigPath, workspaceRoot, projectRoot, pluginName = 'react') {
    const moduleFederationConfigPathJS = (0, path_1.join)(workspaceRoot, projectRoot, 'module-federation.config.js');
    const moduleFederationConfigPathTS = (0, path_1.join)(workspaceRoot, projectRoot, 'module-federation.config.ts');
    let moduleFederationConfigPath = moduleFederationConfigPathJS;
    tsconfigPath =
        tsconfigPath ??
            [
                (0, path_1.join)(projectRoot, 'tsconfig.app.json'),
                (0, path_1.join)(projectRoot, 'tsconfig.json'),
                (0, path_1.join)(workspaceRoot, 'tsconfig.json'),
                (0, path_1.join)(workspaceRoot, 'tsconfig.base.json'),
            ].find((p) => (0, fs_1.existsSync)(p));
    if (!tsconfigPath) {
        throw new Error(`Could not find a tsconfig for remote project located at ${projectRoot}. Please add a tsconfig.app.json or tsconfig.json to the project.`);
    }
    // create a no-op so this can be called with issue
    const fullTSconfigPath = tsconfigPath.startsWith(workspaceRoot)
        ? tsconfigPath
        : (0, path_1.join)(workspaceRoot, tsconfigPath);
    let cleanupTranspiler = () => { };
    if ((0, fs_1.existsSync)(moduleFederationConfigPathTS)) {
        cleanupTranspiler = (0, internal_1.registerTsProject)(fullTSconfigPath);
        moduleFederationConfigPath = moduleFederationConfigPathTS;
    }
    try {
        const config = require(moduleFederationConfigPath);
        cleanupTranspiler();
        return config.default || config;
    }
    catch {
        throw new Error(`Could not load ${moduleFederationConfigPath}. Was this project generated with "@nx/${pluginName}:host"?\nSee: https://nx.dev/concepts/more-concepts/faster-builds-with-module-federation`);
    }
}
