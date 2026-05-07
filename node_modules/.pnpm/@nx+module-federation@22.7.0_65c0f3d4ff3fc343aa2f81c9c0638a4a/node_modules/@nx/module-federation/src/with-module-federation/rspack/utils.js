"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionDeterminateRemoteUrl = getFunctionDeterminateRemoteUrl;
exports.getModuleFederationConfig = getModuleFederationConfig;
const module_federation_config_1 = require("../../utils/module-federation-config");
const utils_1 = require("../react/utils");
const framework_detection_1 = require("../../utils/framework-detection");
/**
 * Creates the default remote URL resolver for rspack.
 * Kept for backward compatibility with existing configs.
 */
function getFunctionDeterminateRemoteUrl(isServer = false) {
    return (0, module_federation_config_1.createDefaultRemoteUrlResolver)(isServer, 'js');
}
/**
 * Framework config for rspack projects (React).
 */
function getRspackFrameworkConfig() {
    return {
        bundler: 'rspack',
        remoteEntryExt: 'js',
        mapRemotesExpose: true,
        applyEagerPackages: (sharedConfig, projectGraph, projectName) => {
            if ((0, framework_detection_1.isReactProject)(projectName, projectGraph)) {
                (0, utils_1.applyDefaultEagerPackages)(sharedConfig);
            }
        },
    };
}
function getModuleFederationConfig(mfConfig, options = { isServer: false }) {
    return (0, module_federation_config_1.getModuleFederationConfigSync)(mfConfig, options, getRspackFrameworkConfig());
}
