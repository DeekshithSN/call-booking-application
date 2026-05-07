"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = moduleFederationSsrDevServer;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const async_iterable_1 = require("@nx/devkit/src/utils/async-iterable");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const utils_1 = require("@nx/module-federation/src/executors/utils");
const wait_for_port_open_1 = require("@nx/web/src/utils/wait-for-port-open");
const ssr_dev_server_impl_1 = tslib_1.__importDefault(require("@nx/webpack/src/executors/ssr-dev-server/ssr-dev-server.impl"));
const fs_1 = require("fs");
const path_1 = require("path");
const lib_1 = require("./lib");
async function* moduleFederationSsrDevServer(ssrDevServerOptions, context) {
    const options = (0, lib_1.normalizeOptions)(ssrDevServerOptions);
    // TODO(JamesHenry): remove type assertion once the nx repo is updated to use https://github.com/nrwl/nx/pull/33095
    let iter = (0, ssr_dev_server_impl_1.default)(options, context);
    const projectConfig = context.projectsConfigurations.projects[context.projectName];
    let pathToManifestFile = (0, path_1.join)(context.root, (0, ts_solution_setup_1.getProjectSourceRoot)(projectConfig), 'assets/module-federation.manifest.json');
    if (options.pathToManifestFile) {
        const userPathToManifestFile = (0, path_1.join)(context.root, options.pathToManifestFile);
        if (!(0, fs_1.existsSync)(userPathToManifestFile)) {
            throw new Error(`The provided Module Federation manifest file path does not exist. Please check the file exists at "${userPathToManifestFile}".`);
        }
        else if ((0, path_1.extname)(userPathToManifestFile) !== '.json') {
            throw new Error(`The Module Federation manifest file must be a JSON. Please ensure the file at ${userPathToManifestFile} is a JSON.`);
        }
        pathToManifestFile = userPathToManifestFile;
    }
    if (!options.isInitialHost) {
        return yield* iter;
    }
    const { staticRemotesIter, devRemoteIters, remotes } = await (0, utils_1.startRemoteIterators)(options, context, lib_1.startRemotes, pathToManifestFile, 'react', true);
    const combined = (0, async_iterable_1.combineAsyncIterables)(staticRemotesIter, ...devRemoteIters);
    let refs = 1 + (devRemoteIters?.length ?? 0);
    for await (const result of combined) {
        if (result.success === false)
            throw new Error('Remotes failed to start');
        if (result.success)
            refs--;
        if (refs === 0)
            break;
    }
    return yield* (0, async_iterable_1.combineAsyncIterables)(iter, (0, async_iterable_1.createAsyncIterable)(async ({ next, done }) => {
        const host = options.host ?? 'localhost';
        const baseUrl = `http${options.ssl ? 's' : ''}://${host}:${options.port}`;
        if (!options.isInitialHost) {
            next({ success: true, baseUrl });
            done();
            return;
        }
        if (remotes.remotePorts.length === 0) {
            next({ success: true, baseUrl });
            done();
            return;
        }
        try {
            const portsToWaitFor = staticRemotesIter && options.staticRemotesPort
                ? [options.staticRemotesPort, ...remotes.remotePorts]
                : [...remotes.remotePorts];
            await Promise.all(portsToWaitFor.map((port) => (0, wait_for_port_open_1.waitForPortOpen)(port, {
                retries: 480,
                retryDelay: 2500,
                host,
            })));
            devkit_1.logger.info(`Nx all ssr remotes have started, server ready at ${baseUrl}`);
            next({ success: true, baseUrl });
        }
        catch (error) {
            throw new Error(`Nx failed to start ssr remotes. Check above for errors.`, {
                cause: error,
            });
        }
        finally {
            done();
        }
    }));
}
