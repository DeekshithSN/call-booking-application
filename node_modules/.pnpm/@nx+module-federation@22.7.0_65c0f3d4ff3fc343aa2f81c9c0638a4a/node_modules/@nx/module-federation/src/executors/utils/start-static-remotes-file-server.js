"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStaticRemotesFileServer = startStaticRemotesFileServer;
exports.startSsrStaticRemotesFileServer = startSsrStaticRemotesFileServer;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const file_server_impl_1 = tslib_1.__importDefault(require("@nx/web/src/executors/file-server/file-server.impl"));
const path_1 = require("path");
const fs_1 = require("fs");
function startStaticRemotesFileServer(staticRemotesConfig, context, options, forceMoveToCommonLocation = false) {
    if (!staticRemotesConfig.remotes ||
        staticRemotesConfig.remotes.length === 0) {
        return;
    }
    let shouldMoveToCommonLocation = forceMoveToCommonLocation || false;
    let commonOutputDirectory;
    if (!forceMoveToCommonLocation) {
        for (const app of staticRemotesConfig.remotes) {
            const remoteBasePath = staticRemotesConfig.config[app].basePath;
            if (!commonOutputDirectory) {
                commonOutputDirectory = remoteBasePath;
            }
            else if (commonOutputDirectory !== remoteBasePath) {
                shouldMoveToCommonLocation = true;
                break;
            }
        }
    }
    if (shouldMoveToCommonLocation) {
        commonOutputDirectory = (0, path_1.join)(devkit_1.workspaceRoot, 'tmp/static-remotes');
        for (const app of staticRemotesConfig.remotes) {
            const remoteConfig = staticRemotesConfig.config[app];
            (0, fs_1.cpSync)(remoteConfig.outputPath, (0, path_1.join)(commonOutputDirectory, remoteConfig.urlSegment), {
                force: true,
                recursive: true,
            });
        }
    }
    const staticRemotesIter = (0, file_server_impl_1.default)({
        cors: true,
        watch: false,
        staticFilePath: commonOutputDirectory,
        parallel: false,
        spa: false,
        withDeps: false,
        host: options.host,
        port: options.staticRemotesPort,
        ssl: options.ssl,
        sslCert: options.sslCert,
        sslKey: options.sslKey,
        cacheSeconds: -1,
    }, context);
    return staticRemotesIter;
}
async function* startSsrStaticRemotesFileServer(staticRemotesConfig, context, options) {
    const staticRemotesIter = startStaticRemotesFileServer(staticRemotesConfig, context, options, true);
    if (!staticRemotesIter) {
        yield { success: true };
        return;
    }
    yield* staticRemotesIter;
}
