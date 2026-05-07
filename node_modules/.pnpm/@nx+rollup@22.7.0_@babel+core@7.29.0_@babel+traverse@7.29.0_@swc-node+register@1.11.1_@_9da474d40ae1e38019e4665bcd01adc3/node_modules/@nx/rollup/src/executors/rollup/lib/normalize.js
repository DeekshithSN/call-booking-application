"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRollupExecutorOptions = normalizeRollupExecutorOptions;
exports.normalizePluginPath = normalizePluginPath;
const path_1 = require("path");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
function normalizeRollupExecutorOptions(options, context) {
    const { root } = context;
    const skipTypeCheck = (0, ts_solution_setup_1.isUsingTsSolutionSetup)() ? true : options.skipTypeCheck;
    return {
        ...options,
        rollupConfig: []
            .concat(options.rollupConfig)
            .filter(Boolean)
            .map((p) => normalizePluginPath(p, root)),
        buildLibsFromSource: options.buildLibsFromSource ?? true,
        projectRoot: context.projectGraph.nodes[context.projectName].data.root,
        skipTypeCheck: skipTypeCheck || false,
    };
}
function normalizePluginPath(pluginPath, root) {
    if (!pluginPath) {
        return '';
    }
    try {
        return require.resolve(pluginPath);
    }
    catch {
        return (0, path_1.resolve)(root, pluginPath);
    }
}
