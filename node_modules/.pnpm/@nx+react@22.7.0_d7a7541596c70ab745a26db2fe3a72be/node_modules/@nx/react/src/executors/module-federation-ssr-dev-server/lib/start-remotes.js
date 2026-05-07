"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRemotes = startRemotes;
const devkit_1 = require("@nx/devkit");
async function startRemotes(remotes, workspaceProjects, options, context) {
    const remoteIters = [];
    const target = 'serve';
    for (const app of remotes) {
        const remoteProjectServeTarget = workspaceProjects[app].targets[target];
        const isUsingModuleFederationSsrDevServerExecutor = remoteProjectServeTarget.executor.includes('module-federation-ssr-dev-server');
        const configurationOverride = options.devRemotes?.find((remote) => typeof remote !== 'string' && remote.remoteName === app)?.configuration;
        {
            const defaultOverrides = {
                ...(options.host ? { host: options.host } : {}),
                ...(options.ssl ? { ssl: options.ssl } : {}),
                ...(options.sslCert ? { sslCert: options.sslCert } : {}),
                ...(options.sslKey ? { sslKey: options.sslKey } : {}),
            };
            const overrides = {
                watch: true,
                ...defaultOverrides,
                ...(isUsingModuleFederationSsrDevServerExecutor
                    ? { isInitialHost: false }
                    : {}),
            };
            remoteIters.push(await (0, devkit_1.runExecutor)({
                project: app,
                target,
                configuration: configurationOverride ?? context.configurationName,
            }, overrides, context));
        }
    }
    return remoteIters;
}
