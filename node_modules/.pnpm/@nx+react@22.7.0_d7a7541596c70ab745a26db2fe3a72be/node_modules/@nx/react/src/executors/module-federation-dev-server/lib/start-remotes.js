"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRemotes = startRemotes;
const devkit_1 = require("@nx/devkit");
async function startRemotes(remotes, workspaceProjects, options, context, target = 'serve') {
    const remoteIters = [];
    for (const app of remotes) {
        const remoteProjectServeTarget = workspaceProjects[app].targets[target];
        const isUsingModuleFederationDevServerExecutor = remoteProjectServeTarget.executor.includes('module-federation-dev-server');
        const configurationOverride = options.devRemotes?.find((r) => typeof r !== 'string' && r.remoteName === app)?.configuration;
        const defaultOverrides = {
            ...(options.host ? { host: options.host } : {}),
            ...(options.ssl ? { ssl: options.ssl } : {}),
            ...(options.sslCert ? { sslCert: options.sslCert } : {}),
            ...(options.sslKey ? { sslKey: options.sslKey } : {}),
        };
        const overrides = target === 'serve'
            ? {
                watch: true,
                ...(isUsingModuleFederationDevServerExecutor
                    ? { isInitialHost: false }
                    : {}),
                ...defaultOverrides,
            }
            : { ...defaultOverrides };
        remoteIters.push(await (0, devkit_1.runExecutor)({
            project: app,
            target,
            configuration: configurationOverride ?? context.configurationName,
        }, overrides, context));
    }
    return remoteIters;
}
