"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStaticRemotesFileServer = startStaticRemotesFileServer;
const path_1 = require("path");
const fs_1 = require("fs");
const node_child_process_1 = require("node:child_process");
const devkit_1 = require("@nx/devkit");
const devkit_internals_1 = require("nx/src/devkit-internals");
function startStaticRemotesFileServer(staticRemotesConfig, root, staticRemotesPort) {
    const remotes = Object.keys(staticRemotesConfig);
    if (!remotes || remotes.length === 0) {
        return;
    }
    let shouldMoveToCommonLocation = false;
    const commonOutputDirectory = (0, path_1.join)(devkit_1.workspaceRoot, 'tmp/static-remotes');
    for (const app of remotes) {
        const remoteConfig = staticRemotesConfig[app];
        if (remoteConfig) {
            (0, fs_1.cpSync)(remoteConfig.outputPath, (0, path_1.join)(commonOutputDirectory, remoteConfig.urlSegment), {
                force: true,
                recursive: true,
            });
        }
    }
    const { path: pathToHttpServerPkgJson, packageJson } = (0, devkit_internals_1.readModulePackageJson)('http-server', module.paths);
    const pathToHttpServerBin = packageJson.bin['http-server'];
    const pathToHttpServer = (0, path_1.resolve)(pathToHttpServerPkgJson.replace('package.json', ''), pathToHttpServerBin);
    const httpServerProcess = (0, node_child_process_1.fork)(pathToHttpServer, [
        commonOutputDirectory,
        `-p=${staticRemotesPort}`,
        `-a=localhost`,
        `--cors`,
    ], {
        stdio: 'pipe',
        cwd: root,
        env: {
            FORCE_COLOR: 'true',
            ...process.env,
        },
    });
    process.on('SIGTERM', () => httpServerProcess.kill('SIGTERM'));
    process.on('exit', () => httpServerProcess.kill('SIGTERM'));
}
