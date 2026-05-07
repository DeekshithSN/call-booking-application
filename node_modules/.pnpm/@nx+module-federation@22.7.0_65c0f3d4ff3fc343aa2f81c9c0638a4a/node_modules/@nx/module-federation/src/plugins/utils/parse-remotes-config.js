"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRemotesConfig = parseRemotesConfig;
const path_1 = require("path");
const devkit_internals_1 = require("nx/src/devkit-internals");
const devkit_1 = require("@nx/devkit");
function parseRemotesConfig(remotes, workspaceRoot, projectGraph, isServer) {
    if (!remotes?.length) {
        return { remotes: [], config: undefined };
    }
    const config = {};
    for (const app of remotes) {
        const projectRoot = projectGraph.nodes[app].data.root;
        let outputPath = (0, devkit_internals_1.interpolate)(projectGraph.nodes[app].data.targets?.['build']?.options?.outputPath ??
            projectGraph.nodes[app].data.targets?.['build']?.outputs?.[0] ??
            `${workspaceRoot ? `${workspaceRoot}/` : ''}${projectGraph.nodes[app].data.root}/dist`, {
            projectName: projectGraph.nodes[app].data.name,
            projectRoot,
            workspaceRoot,
        });
        if (!outputPath.startsWith(workspaceRoot)) {
            outputPath = (0, devkit_1.joinPathFragments)(workspaceRoot, outputPath);
        }
        const basePath = (0, path_1.dirname)(outputPath);
        const urlSegment = app;
        const port = projectGraph.nodes[app].data.targets?.['serve']?.options.port;
        config[app] = {
            basePath,
            outputPath: isServer ? (0, path_1.dirname)(outputPath) : outputPath,
            urlSegment,
            port,
        };
    }
    return { remotes, config };
}
