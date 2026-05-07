"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRemoteIterators = startRemoteIterators;
const utils_1 = require("../../utils");
const build_static_remotes_1 = require("./build-static-remotes");
const start_static_remotes_file_server_1 = require("./start-static-remotes-file-server");
const devkit_1 = require("@nx/devkit");
async function startRemoteIterators(options, context, startRemoteFn, pathToManifestFile, pluginName = 'react', isServer = false) {
    const nxBin = require.resolve('nx/bin/nx');
    const { projects: workspaceProjects } = (0, devkit_1.readProjectsConfigurationFromProjectGraph)(context.projectGraph);
    const project = workspaceProjects[context.projectName];
    const buildTargetName = (0, utils_1.getBuildTargetNameFromMFDevServer)(project, context.projectGraph);
    const moduleFederationConfig = (0, utils_1.getModuleFederationConfig)(project.targets?.[buildTargetName]?.options?.tsConfig, context.root, project.root, pluginName);
    const remoteNames = options.devRemotes.map((r) => typeof r === 'string' ? r : r.remoteName);
    const remotes = (0, utils_1.getRemotes)(remoteNames, options.skipRemotes, moduleFederationConfig, {
        projectName: project.name,
        projectGraph: context.projectGraph,
        root: context.root,
    }, pathToManifestFile);
    options.staticRemotesPort ??= remotes.staticRemotePort;
    // Set NX_MF_DEV_REMOTES for the Nx Runtime Library Control Plugin
    process.env.NX_MF_DEV_REMOTES = JSON.stringify([
        ...(remotes.devRemotes.map((r) => typeof r === 'string' ? r : r.remoteName) ?? []).map((r) => (0, utils_1.normalizeProjectName)(r)),
        (0, utils_1.normalizeProjectName)(project.name),
    ]);
    const staticRemotesConfig = isServer
        ? (0, utils_1.parseStaticSsrRemotesConfig)([...remotes.staticRemotes, ...remotes.dynamicRemotes], context)
        : (0, utils_1.parseStaticRemotesConfig)([...remotes.staticRemotes, ...remotes.dynamicRemotes], context);
    const mappedLocationsOfStaticRemotes = await (0, build_static_remotes_1.buildStaticRemotes)(staticRemotesConfig, nxBin, context, options, isServer ? 'server' : 'build');
    const devRemoteIters = await startRemoteFn(remotes.devRemotes, workspaceProjects, options, context, 'serve');
    const staticRemotesIter = isServer
        ? (0, start_static_remotes_file_server_1.startSsrStaticRemotesFileServer)(staticRemotesConfig, context, options)
        : (0, start_static_remotes_file_server_1.startStaticRemotesFileServer)(staticRemotesConfig, context, options);
    isServer
        ? await (0, utils_1.startSsrRemoteProxies)(staticRemotesConfig, mappedLocationsOfStaticRemotes, options.ssl
            ? {
                pathToCert: options.sslCert,
                pathToKey: options.sslKey,
            }
            : undefined, options.host)
        : await (0, utils_1.startRemoteProxies)(staticRemotesConfig, mappedLocationsOfStaticRemotes, options.ssl
            ? {
                pathToCert: options.sslCert,
                pathToKey: options.sslKey,
            }
            : undefined, options.host);
    return {
        remotes,
        devRemoteIters,
        staticRemotesIter,
    };
}
