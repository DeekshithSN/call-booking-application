"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = moduleFederationDevServer;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const async_iterable_1 = require("@nx/devkit/src/utils/async-iterable");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const utils_1 = require("@nx/module-federation/src/executors/utils");
const file_server_impl_1 = tslib_1.__importDefault(require("@nx/web/src/executors/file-server/file-server.impl"));
const wait_for_port_open_1 = require("@nx/web/src/utils/wait-for-port-open");
const dev_server_impl_1 = tslib_1.__importDefault(require("@nx/webpack/src/executors/dev-server/dev-server.impl"));
const fs_1 = require("fs");
const path_1 = require("path");
const lib_1 = require("./lib");
async function* moduleFederationDevServer(schema, context) {
    const options = (0, lib_1.normalizeOptions)(schema);
    const currIter = options.static
        ? (0, file_server_impl_1.default)({
            ...options,
            parallel: false,
            withDeps: false,
            spa: false,
            cors: true,
            cacheSeconds: -1,
        }, context)
        : // TODO(JamesHenry): remove type assertion once the nx repo is updated to use https://github.com/nrwl/nx/pull/33095
            (0, dev_server_impl_1.default)(options, context);
    const p = context.projectsConfigurations.projects[context.projectName];
    let pathToManifestFile = (0, path_1.join)(context.root, (0, ts_solution_setup_1.getProjectSourceRoot)(p), 'assets/module-federation.manifest.json');
    if (options.pathToManifestFile) {
        const userPathToManifestFile = (0, path_1.join)(context.root, options.pathToManifestFile);
        if (!(0, fs_1.existsSync)(userPathToManifestFile)) {
            throw new Error(`The provided Module Federation manifest file path does not exist. Please check the file exists at "${userPathToManifestFile}".`);
        }
        else if ((0, path_1.extname)(options.pathToManifestFile) !== '.json') {
            throw new Error(`The Module Federation manifest file must be a JSON. Please ensure the file at ${userPathToManifestFile} is a JSON.`);
        }
        pathToManifestFile = userPathToManifestFile;
    }
    if (!options.isInitialHost) {
        return yield* currIter;
    }
    const { staticRemotesIter, devRemoteIters, remotes } = await (0, utils_1.startRemoteIterators)(options, context, lib_1.startRemotes, pathToManifestFile, 'react');
    return yield* (0, async_iterable_1.combineAsyncIterables)(currIter, ...devRemoteIters, ...(staticRemotesIter ? [staticRemotesIter] : []), (0, async_iterable_1.createAsyncIterable)(async ({ next, done }) => {
        if (!options.isInitialHost) {
            done();
            return;
        }
        if (remotes.remotePorts.length === 0) {
            done();
            return;
        }
        try {
            const host = options.host ?? 'localhost';
            const baseUrl = `http${options.ssl ? 's' : ''}://${host}:${options.port}`;
            const portsToWaitFor = staticRemotesIter && options.staticRemotesPort
                ? [options.staticRemotesPort, ...remotes.remotePorts]
                : [...remotes.remotePorts];
            await Promise.all(portsToWaitFor.map((port) => (0, wait_for_port_open_1.waitForPortOpen)(port, {
                retries: 480,
                retryDelay: 2500,
                host: host,
            })));
            devkit_1.logger.info(`NX All remotes started, server ready at ${baseUrl}`);
            next({ success: true, baseUrl: baseUrl });
        }
        catch (err) {
            throw new Error(`Failed to start remotes. Check above for any errors.`, {
                cause: err,
            });
        }
        finally {
            done();
        }
    }));
}
