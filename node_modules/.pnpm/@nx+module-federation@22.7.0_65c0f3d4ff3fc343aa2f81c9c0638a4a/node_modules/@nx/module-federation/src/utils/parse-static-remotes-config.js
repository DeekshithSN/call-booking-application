"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStaticRemotesConfig = parseStaticRemotesConfig;
exports.parseStaticSsrRemotesConfig = parseStaticSsrRemotesConfig;
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
const utils_1 = require("nx/src/tasks-runner/utils");
function parseStaticRemotesConfig(staticRemotes, context) {
    if (!staticRemotes?.length) {
        return { remotes: [], config: undefined };
    }
    const config = {};
    for (const app of staticRemotes) {
        const projectGraph = context.projectGraph;
        const projectRoot = projectGraph.nodes[app].data.root;
        let outputPath = (0, utils_1.interpolate)(projectGraph.nodes[app].data.targets?.['build']?.options?.outputPath ??
            projectGraph.nodes[app].data.targets?.['build']?.outputs?.[0] ??
            `${context.root}/${projectGraph.nodes[app].data.root}/dist`, {
            projectName: projectGraph.nodes[app].data.name,
            projectRoot,
            workspaceRoot: context.root,
        });
        if (outputPath.startsWith(projectRoot)) {
            outputPath = (0, devkit_1.joinPathFragments)(context.root, outputPath);
        }
        const basePath = ['', '/', '.'].some((p) => (0, path_1.dirname)(outputPath) === p)
            ? outputPath
            : (0, path_1.dirname)(outputPath); // dist || dist/checkout -> dist
        const urlSegment = app;
        const port = context.projectGraph.nodes[app].data.targets['serve'].options.port;
        config[app] = { basePath, outputPath, urlSegment, port };
    }
    return { remotes: staticRemotes, config };
}
function parseStaticSsrRemotesConfig(staticRemotes, context) {
    if (!staticRemotes?.length) {
        return { remotes: [], config: undefined };
    }
    const config = {};
    for (const app of staticRemotes) {
        const projectGraph = context.projectGraph;
        const projectRoot = projectGraph.nodes[app].data.root;
        let outputPath = (0, utils_1.interpolate)(projectGraph.nodes[app].data.targets?.['build']?.options?.outputPath ??
            projectGraph.nodes[app].data.targets?.['build']?.outputs?.[0] ??
            `${context.root}/${projectGraph.nodes[app].data.root}/dist`, {
            projectName: projectGraph.nodes[app].data.name,
            projectRoot,
            workspaceRoot: context.root,
        });
        if (outputPath.startsWith(projectRoot)) {
            outputPath = (0, devkit_1.joinPathFragments)(context.root, outputPath);
        }
        outputPath = (0, path_1.dirname)(outputPath);
        const basePath = ['', '/', '.'].some((p) => (0, path_1.dirname)(outputPath) === p)
            ? outputPath
            : (0, path_1.dirname)(outputPath); // dist || dist/checkout -> dist
        const urlSegment = app;
        const port = context.projectGraph.nodes[app].data.targets['serve'].options.port;
        config[app] = { basePath, outputPath, urlSegment, port };
    }
    return { remotes: staticRemotes, config };
}
