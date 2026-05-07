"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeViteConfigFilePath = normalizeViteConfigFilePath;
exports.getProjectTsConfigPath = getProjectTsConfigPath;
exports.getViteServerProxyConfigPath = getViteServerProxyConfigPath;
exports.getViteServerOptions = getViteServerOptions;
exports.getProxyConfig = getProxyConfig;
exports.getNxTargetOptions = getNxTargetOptions;
const devkit_1 = require("@nx/devkit");
const fs_1 = require("fs");
const executor_utils_1 = require("./executor-utils");
/**
 * Returns the path to the vite config file or undefined when not found.
 */
function normalizeViteConfigFilePath(contextRoot, projectRoot, configFile) {
    if (configFile) {
        const normalized = (0, devkit_1.joinPathFragments)(contextRoot, configFile);
        if (!(0, fs_1.existsSync)(normalized)) {
            throw new Error(`Could not find vite config at provided path "${normalized}".`);
        }
        return normalized;
    }
    const allowsExt = ['js', 'mjs', 'ts', 'cjs', 'mts', 'cts'];
    for (const ext of allowsExt) {
        if ((0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(contextRoot, projectRoot, `vite.config.${ext}`))) {
            return (0, devkit_1.joinPathFragments)(contextRoot, projectRoot, `vite.config.${ext}`);
        }
        else if ((0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(contextRoot, projectRoot, `vitest.config.${ext}`))) {
            return (0, devkit_1.joinPathFragments)(contextRoot, projectRoot, `vitest.config.${ext}`);
        }
    }
}
function getProjectTsConfigPath(projectRoot) {
    return (0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot, 'tsconfig.app.json'))
        ? (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.app.json')
        : (0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot, 'tsconfig.lib.json'))
            ? (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.lib.json')
            : (0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot, 'tsconfig.json'))
                ? (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.json')
                : undefined;
}
/**
 * Returns the path to the proxy configuration file or undefined when not found.
 */
function getViteServerProxyConfigPath(nxProxyConfig, context) {
    if (nxProxyConfig) {
        const projectRoot = context.projectsConfigurations.projects[context.projectName].root;
        const proxyConfigPath = nxProxyConfig
            ? (0, devkit_1.joinPathFragments)(context.root, nxProxyConfig)
            : (0, devkit_1.joinPathFragments)(projectRoot, 'proxy.conf.json');
        if ((0, fs_1.existsSync)(proxyConfigPath)) {
            return proxyConfigPath;
        }
    }
}
/**
 * Builds the options for the vite dev server.
 */
async function getViteServerOptions(options, context) {
    // returns vite ServerOptions
    // Allows ESM to be required in CJS modules. Vite will be published as ESM in the future.
    const { searchForWorkspaceRoot } = await (0, executor_utils_1.loadViteDynamicImport)();
    const projectRoot = context.projectsConfigurations.projects[context.projectName].root;
    const serverOptions = {
        fs: {
            allow: [
                searchForWorkspaceRoot((0, devkit_1.joinPathFragments)(projectRoot)),
                (0, devkit_1.joinPathFragments)(context.root, 'node_modules/vite'),
            ],
        },
    };
    const proxyConfigPath = getViteServerProxyConfigPath(options.proxyConfig, context);
    if (proxyConfigPath) {
        devkit_1.logger.info(`Loading proxy configuration from: ${proxyConfigPath}`);
        serverOptions.proxy = require(proxyConfigPath);
    }
    return serverOptions;
}
function getProxyConfig(context, proxyConfig) {
    const proxyConfigPath = getViteServerProxyConfigPath(proxyConfig, context);
    if (proxyConfigPath) {
        devkit_1.logger.info(`Loading proxy configuration from: ${proxyConfigPath}`);
        return require(proxyConfigPath);
    }
    return;
}
function getNxTargetOptions(target, context) {
    const targetObj = (0, devkit_1.parseTargetString)(target, context);
    return (0, devkit_1.readTargetOptions)(targetObj, context);
}
