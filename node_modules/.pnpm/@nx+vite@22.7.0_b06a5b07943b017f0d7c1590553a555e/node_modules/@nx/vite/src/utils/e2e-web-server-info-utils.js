"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViteE2EWebServerInfo = getViteE2EWebServerInfo;
exports.getReactRouterE2EWebServerInfo = getReactRouterE2EWebServerInfo;
const devkit_1 = require("@nx/devkit");
const e2e_web_server_info_utils_1 = require("@nx/devkit/src/generators/e2e-web-server-info-utils");
async function getViteE2EWebServerInfo(tree, projectName, configFilePath, isPluginBeingAdded, e2ePortOverride, e2eCIPortOverride) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    let e2ePort = e2ePortOverride ?? 4200;
    if ((nxJson.targetDefaults?.['dev'] &&
        nxJson.targetDefaults?.['dev'].options?.port) ||
        (nxJson.targetDefaults?.['serve'] &&
            nxJson.targetDefaults?.['serve'].options?.port)) {
        e2ePort =
            nxJson.targetDefaults?.['dev'].options?.port ??
                nxJson.targetDefaults?.['serve'].options?.port;
    }
    return (0, e2e_web_server_info_utils_1.getE2EWebServerInfo)(tree, projectName, {
        plugin: '@nx/vite/plugin',
        serveTargetName: 'devTargetName',
        serveStaticTargetName: 'previewTargetName',
        configFilePath,
    }, {
        defaultServeTargetName: 'dev',
        defaultServeStaticTargetName: 'preview',
        defaultE2EWebServerAddress: `http://localhost:${e2ePort}`,
        defaultE2ECiBaseUrl: `http://localhost:${e2eCIPortOverride ?? 4300}`,
        defaultE2EPort: e2ePort,
    }, isPluginBeingAdded);
}
async function getReactRouterE2EWebServerInfo(tree, projectName, configFilePath, isPluginBeingAdded, e2ePortOverride, e2eCIPortOverride) {
    const e2ePort = e2ePortOverride ?? parseInt(process.env.PORT) ?? 4200;
    return await (0, e2e_web_server_info_utils_1.getE2EWebServerInfo)(tree, projectName, {
        plugin: '@nx/react/router-plugin',
        serveTargetName: 'devTargetName',
        serveStaticTargetName: 'devTargetName',
        configFilePath,
    }, {
        defaultServeTargetName: 'dev',
        defaultServeStaticTargetName: 'dev',
        defaultE2EWebServerAddress: `http://localhost:${e2ePort}`,
        defaultE2ECiBaseUrl: `http://localhost:${e2eCIPortOverride ?? 4200}`,
        defaultE2EPort: e2ePort,
    }, isPluginBeingAdded);
}
