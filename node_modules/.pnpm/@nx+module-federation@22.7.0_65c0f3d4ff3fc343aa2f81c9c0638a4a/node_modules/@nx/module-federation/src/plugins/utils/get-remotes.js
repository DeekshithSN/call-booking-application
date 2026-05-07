"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemotes = getRemotes;
const devkit_1 = require("@nx/devkit");
const utils_1 = require("../../utils");
const fs_1 = require("fs");
const path_1 = require("path");
function getRemotes(config, projectGraph, pathToManifestFile) {
    const collectedRemotes = new Set();
    const { remotes, dynamicRemotes } = extractRemoteProjectsFromConfig(config, pathToManifestFile);
    remotes.forEach((r) => collectRemoteProjects(r, collectedRemotes, projectGraph));
    // With dynamic remotes, the manifest file may contain the names with `_` due to MF limitations on naming
    // The project graph might contain these names with `-` rather than `_`. Check for both.
    // This can occur after migration of existing remotes past Nx 19.8
    let normalizedDynamicRemotes = dynamicRemotes.map((r) => {
        if (projectGraph.nodes[r.replace(/_/g, '-')]) {
            return r.replace(/_/g, '-');
        }
        return r;
    });
    const knownDynamicRemotes = normalizedDynamicRemotes.filter((r) => projectGraph.nodes[r]);
    knownDynamicRemotes.forEach((r) => collectRemoteProjects(r, collectedRemotes, projectGraph));
    const remotePorts = [...collectedRemotes, ...knownDynamicRemotes].map((r) => projectGraph.nodes[r].data.targets['serve'].options.port);
    const staticRemotePort = Math.max(...[...remotePorts]) + 1;
    return {
        remotes: Array.from(collectedRemotes),
        remotePorts,
        staticRemotePort,
    };
}
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
            if (Object.keys(parsedManifest).every((key) => typeof key === 'string')) {
                dynamicRemotes.push(...Object.keys(parsedManifest));
            }
        }
    }
    const staticRemotes = config.remotes?.map((r) => (Array.isArray(r) ? r[0] : r)) ?? [];
    remotes.push(...staticRemotes);
    return { remotes, dynamicRemotes };
}
function collectRemoteProjects(remote, collected, projectGraph) {
    const remoteProject = projectGraph.nodes[remote]?.data;
    if (!projectGraph.nodes[remote] || collected.has(remote)) {
        return;
    }
    collected.add(remote);
    const remoteProjectRoot = remoteProject.root;
    let remoteProjectTsConfig = ['tsconfig.app.json', 'tsconfig.json']
        .map((p) => (0, path_1.join)(devkit_1.workspaceRoot, remoteProjectRoot, p))
        .find((p) => (0, fs_1.existsSync)(p));
    const remoteProjectConfig = (0, utils_1.getModuleFederationConfig)(remoteProjectTsConfig, devkit_1.workspaceRoot, remoteProjectRoot);
    const { remotes: remoteProjectRemotes } = extractRemoteProjectsFromConfig(remoteProjectConfig);
    remoteProjectRemotes.forEach((r) => collectRemoteProjects(r, collected, projectGraph));
}
