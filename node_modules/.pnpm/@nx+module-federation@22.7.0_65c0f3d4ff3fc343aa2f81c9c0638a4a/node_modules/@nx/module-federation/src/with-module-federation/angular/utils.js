"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_NPM_PACKAGES_TO_AVOID = exports.DEFAULT_ANGULAR_PACKAGES_TO_SHARE = void 0;
exports.applyDefaultEagerPackages = applyDefaultEagerPackages;
exports.getFunctionDeterminateRemoteUrl = getFunctionDeterminateRemoteUrl;
exports.getModuleFederationConfig = getModuleFederationConfig;
exports.getModuleFederationConfigSync = getModuleFederationConfigSync;
const module_federation_config_1 = require("../../utils/module-federation-config");
/**
 * Default npm packages to always share for Angular projects.
 */
exports.DEFAULT_ANGULAR_PACKAGES_TO_SHARE = [
    '@angular/core',
    '@angular/animations',
    '@angular/common',
];
/**
 * npm packages to avoid sharing in Angular projects.
 */
exports.DEFAULT_NPM_PACKAGES_TO_AVOID = [
    'zone.js',
    '@nx/angular/mf',
    '@nrwl/angular/mf',
    '@nx/angular-rspack',
];
/**
 * Applies eager loading to default Angular packages.
 * Exported for backward compatibility.
 */
function applyDefaultEagerPackages(sharedConfig, useRspack = false) {
    const DEFAULT_PACKAGES_TO_LOAD_EAGERLY = [
        '@angular/localize',
        '@angular/localize/init',
        ...(useRspack
            ? [
                '@angular/core',
                '@angular/core/primitives/signals',
                '@angular/core/primitives/di',
                '@angular/core/event-dispatch',
                '@angular/core/rxjs-interop',
                '@angular/common',
                '@angular/common/http',
                '@angular/platform-browser',
            ]
            : []),
    ];
    for (const pkg of DEFAULT_PACKAGES_TO_LOAD_EAGERLY) {
        if (!sharedConfig[pkg]) {
            continue;
        }
        sharedConfig[pkg] = { ...sharedConfig[pkg], eager: true };
    }
}
/**
 * Creates the default remote URL resolver for Angular.
 * Kept for backward compatibility with existing configs.
 */
function getFunctionDeterminateRemoteUrl(isServer = false, useRspack = false) {
    return (0, module_federation_config_1.createDefaultRemoteUrlResolver)(isServer, useRspack ? 'js' : 'mjs');
}
/**
 * Creates framework config for Angular projects.
 */
function getAngularFrameworkConfig(bundler, useRspack) {
    return {
        bundler,
        remoteEntryExt: useRspack ? 'js' : 'mjs',
        mapRemotesExpose: false,
        defaultPackagesToShare: exports.DEFAULT_ANGULAR_PACKAGES_TO_SHARE,
        packagesToAvoid: exports.DEFAULT_NPM_PACKAGES_TO_AVOID,
        applyEagerPackages: (sharedConfig) => {
            applyDefaultEagerPackages(sharedConfig, useRspack);
        },
    };
}
async function getModuleFederationConfig(mfConfig, options = { isServer: false }, bundler = 'rspack') {
    // Angular async uses 'mjs' extension (webpack), not rspack
    return (0, module_federation_config_1.getModuleFederationConfigAsync)(mfConfig, options, getAngularFrameworkConfig(bundler, false));
}
function getModuleFederationConfigSync(mfConfig, options = { isServer: false }, useRspack = false) {
    return (0, module_federation_config_1.getModuleFederationConfigSync)(mfConfig, options, getAngularFrameworkConfig('rspack', useRspack));
}
