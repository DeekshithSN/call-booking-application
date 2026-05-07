"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startProxies = startProxies;
exports.default = moduleFederationStaticServer;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const async_iterable_1 = require("@nx/devkit/src/utils/async-iterable");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const utils_1 = require("@nx/module-federation/src/executors/utils");
const utils_2 = require("@nx/module-federation/src/utils");
const file_server_impl_1 = tslib_1.__importDefault(require("@nx/web/src/executors/file-server/file-server.impl"));
const wait_for_port_open_1 = require("@nx/web/src/utils/wait-for-port-open");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
function getBuildAndServeOptionsFromServeTarget(serveTarget, context) {
    const target = (0, devkit_1.parseTargetString)(serveTarget, context);
    const serveOptions = (0, devkit_1.readTargetOptions)(target, context);
    const buildTarget = (0, devkit_1.parseTargetString)(serveOptions.buildTarget, context);
    const buildOptions = (0, devkit_1.readTargetOptions)(buildTarget, context);
    let pathToManifestFile = (0, path_1.join)(context.root, (0, ts_solution_setup_1.getProjectSourceRoot)(context.projectGraph.nodes[context.projectName].data), 'assets/module-federation.manifest.json');
    if (serveOptions.pathToManifestFile) {
        const userPathToManifestFile = (0, path_1.join)(context.root, serveOptions.pathToManifestFile);
        if (!(0, fs_1.existsSync)(userPathToManifestFile)) {
            throw new Error(`The provided Module Federation manifest file path does not exist. Please check the file exists at "${userPathToManifestFile}".`);
        }
        else if ((0, path_1.extname)(serveOptions.pathToManifestFile) !== '.json') {
            throw new Error(`The Module Federation manifest file must be a JSON. Please ensure the file at ${userPathToManifestFile} is a JSON.`);
        }
        pathToManifestFile = userPathToManifestFile;
    }
    return {
        buildTarget,
        buildOptions,
        serveOptions,
        pathToManifestFile,
    };
}
async function buildHost(nxBin, buildTarget, context) {
    await new Promise((res, rej) => {
        const staticProcess = (0, child_process_1.fork)(nxBin, [
            `run`,
            `${buildTarget.project}:${buildTarget.target}${buildTarget.configuration
                ? `:${buildTarget.configuration}`
                : context.configurationName
                    ? `:${context.configurationName}`
                    : ''}`,
        ], {
            cwd: context.root,
            stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        });
        staticProcess.stdout.on('data', (data) => {
            const ANSII_CODE_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
            const stdoutString = data.toString().replace(ANSII_CODE_REGEX, '');
            // in addition to writing into the stdout stream, also show error directly in console
            // so the error is easily discoverable. 'ERROR in' is the key word to search in webpack output.
            if (stdoutString.includes('ERROR in')) {
                devkit_1.logger.log(stdoutString);
            }
            if (stdoutString.includes('Successfully ran target build')) {
                staticProcess.stdout.removeAllListeners('data');
                devkit_1.logger.info(`NX Built Consumer (host)`);
                res();
            }
        });
        staticProcess.stderr.on('data', (data) => devkit_1.logger.info(data.toString()));
        staticProcess.once('exit', (code) => {
            staticProcess.stdout.removeAllListeners('data');
            staticProcess.stderr.removeAllListeners('data');
            if (code !== 0) {
                rej(`Consumer (host) failed to build. See above for details.`);
            }
            else {
                res();
            }
        });
        process.on('SIGTERM', () => staticProcess.kill('SIGTERM'));
        process.on('exit', () => staticProcess.kill('SIGTERM'));
    });
}
function moveToTmpDirectory(staticRemotesConfig, hostOutputPath, hostUrlSegment) {
    const commonOutputDirectory = (0, path_1.join)(devkit_1.workspaceRoot, 'tmp/static-module-federation');
    for (const app of staticRemotesConfig.remotes) {
        const remoteConfig = staticRemotesConfig.config[app];
        (0, fs_1.cpSync)(remoteConfig.outputPath, (0, path_1.join)(commonOutputDirectory, remoteConfig.urlSegment), {
            force: true,
            recursive: true,
        });
    }
    (0, fs_1.cpSync)(hostOutputPath, (0, path_1.join)(commonOutputDirectory, hostUrlSegment), {
        force: true,
        recursive: true,
    });
    const cleanup = () => {
        (0, fs_1.rmSync)(commonOutputDirectory, { force: true, recursive: true });
    };
    process.on('SIGTERM', () => {
        cleanup();
    });
    process.on('exit', () => {
        cleanup();
    });
    return commonOutputDirectory;
}
function startProxies(staticRemotesConfig, hostServeOptions, mappedLocationOfHost, mappedLocationsOfRemotes, sslOptions) {
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const express = require('express');
    let sslCert;
    let sslKey;
    if (sslOptions && sslOptions.pathToCert && sslOptions.pathToKey) {
        if ((0, fs_1.existsSync)(sslOptions.pathToCert) && (0, fs_1.existsSync)(sslOptions.pathToKey)) {
            sslCert = (0, fs_1.readFileSync)(sslOptions.pathToCert);
            sslKey = (0, fs_1.readFileSync)(sslOptions.pathToKey);
        }
        else {
            devkit_1.logger.warn(`Encountered SSL options in project.json, however, the certificate files do not exist in the filesystem. Using http.`);
            devkit_1.logger.warn(`Attempted to find '${sslOptions.pathToCert}' and '${sslOptions.pathToKey}'.`);
        }
    }
    const http = require('http');
    const https = require('https');
    devkit_1.logger.info(`NX Starting static remotes proxies...`);
    for (const app of staticRemotesConfig.remotes) {
        const expressProxy = express();
        expressProxy.use(createProxyMiddleware({
            target: mappedLocationsOfRemotes[app],
            changeOrigin: true,
            secure: sslCert ? false : undefined,
        }));
        const proxyServer = (sslCert ? https : http)
            .createServer({ cert: sslCert, key: sslKey }, expressProxy)
            .listen(staticRemotesConfig.config[app].port);
        process.on('SIGTERM', () => proxyServer.close());
        process.on('exit', () => proxyServer.close());
    }
    devkit_1.logger.info(`NX Static Producers (remotes) proxies started successfully`);
    devkit_1.logger.info(`NX Starting static Consumer (host) proxy...`);
    const expressProxy = express();
    expressProxy.use(createProxyMiddleware({
        target: mappedLocationOfHost,
        changeOrigin: true,
        secure: sslCert ? false : undefined,
        pathRewrite: (path) => {
            let pathRewrite = path;
            for (const app of staticRemotesConfig.remotes) {
                if (path.endsWith(app)) {
                    pathRewrite = '/';
                    break;
                }
            }
            return pathRewrite;
        },
    }));
    const proxyServer = (sslCert ? https : http)
        .createServer({ cert: sslCert, key: sslKey }, expressProxy)
        .listen(hostServeOptions.port);
    process.on('SIGTERM', () => proxyServer.close());
    process.on('exit', () => proxyServer.close());
    devkit_1.logger.info('NX Static Consumer (host) proxy started successfully');
}
async function* moduleFederationStaticServer(schema, context) {
    // Force Node to resolve to look for the nx binary that is inside node_modules
    const nxBin = require.resolve('nx/bin/nx');
    // Get the remotes from the module federation config
    const p = context.projectsConfigurations.projects[context.projectName];
    const options = getBuildAndServeOptionsFromServeTarget(schema.serveTarget, context);
    const moduleFederationConfig = (0, utils_2.getModuleFederationConfig)(options.buildOptions.tsConfig, context.root, p.root, 'react');
    const remotes = (0, utils_2.getRemotes)([], options.serveOptions.skipRemotes, moduleFederationConfig, {
        projectName: context.projectName,
        projectGraph: context.projectGraph,
        root: context.root,
    }, options.pathToManifestFile);
    const staticRemotesConfig = (0, utils_2.parseStaticRemotesConfig)([...remotes.staticRemotes, ...remotes.dynamicRemotes], context);
    options.serveOptions.staticRemotesPort ??= remotes.staticRemotePort;
    const mappedLocationsOfStaticRemotes = await (0, utils_1.buildStaticRemotes)(staticRemotesConfig, nxBin, context, options.serveOptions);
    // Build the host
    const hostUrlSegment = (0, path_1.basename)(options.buildOptions.outputPath);
    const mappedLocationOfHost = `http${options.serveOptions.ssl ? 's' : ''}://${options.serveOptions.host}:${options.serveOptions.staticRemotesPort}/${hostUrlSegment}`;
    await buildHost(nxBin, options.buildTarget, context);
    // Move to a temporary directory
    const commonOutputDirectory = moveToTmpDirectory(staticRemotesConfig, options.buildOptions.outputPath, hostUrlSegment);
    // File Serve the temporary directory
    const staticFileServerIter = (0, file_server_impl_1.default)({
        cors: true,
        watch: false,
        staticFilePath: commonOutputDirectory,
        parallel: false,
        spa: false,
        withDeps: false,
        host: options.serveOptions.host,
        port: options.serveOptions.staticRemotesPort,
        ssl: options.serveOptions.ssl,
        sslCert: options.serveOptions.sslCert,
        sslKey: options.serveOptions.sslKey,
        cacheSeconds: -1,
    }, context);
    // express proxy all of it
    startProxies(staticRemotesConfig, options.serveOptions, mappedLocationOfHost, mappedLocationsOfStaticRemotes, options.serveOptions.ssl
        ? {
            pathToCert: (0, path_1.join)(devkit_1.workspaceRoot, options.serveOptions.sslCert),
            pathToKey: (0, path_1.join)(devkit_1.workspaceRoot, options.serveOptions.sslKey),
        }
        : undefined);
    return yield* (0, async_iterable_1.combineAsyncIterables)(staticFileServerIter, (0, async_iterable_1.createAsyncIterable)(async ({ next, done }) => {
        const host = options.serveOptions.host ?? 'localhost';
        const baseUrl = `http${options.serveOptions.ssl ? 's' : ''}://${host}:${options.serveOptions.port}`;
        if (remotes.remotePorts.length === 0) {
            const portsToWaitFor = [options.serveOptions.staticRemotesPort];
            await Promise.all(portsToWaitFor.map((port) => (0, wait_for_port_open_1.waitForPortOpen)(port, {
                retries: 480,
                retryDelay: 2500,
                host: host,
            })));
            devkit_1.logger.info(`NX Server ready at ${baseUrl}`);
            next({ success: true, baseUrl: baseUrl });
            done();
            return;
        }
        try {
            const portsToWaitFor = staticFileServerIter && options.serveOptions.staticRemotesPort
                ? [options.serveOptions.staticRemotesPort, ...remotes.remotePorts]
                : [...remotes.remotePorts];
            await Promise.all(portsToWaitFor.map((port) => (0, wait_for_port_open_1.waitForPortOpen)(port, {
                retries: 480,
                retryDelay: 2500,
                host: host,
            })));
            devkit_1.logger.info(`NX Server ready at ${baseUrl}`);
            next({ success: true, baseUrl: baseUrl });
        }
        catch (err) {
            throw new Error(`Failed to start. Check above for any errors.`, {
                cause: err,
            });
        }
        finally {
            done();
        }
    }));
}
