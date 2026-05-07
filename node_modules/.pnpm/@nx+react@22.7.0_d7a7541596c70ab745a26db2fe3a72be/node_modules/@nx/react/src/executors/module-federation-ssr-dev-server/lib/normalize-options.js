"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
exports.getBuildOptions = getBuildOptions;
const path_1 = require("path");
const devkit_1 = require("@nx/devkit");
function normalizeOptions(options) {
    return {
        ...options,
        devRemotes: options.devRemotes ?? [],
        verbose: options.verbose ?? false,
        ssl: options.ssl ?? false,
        sslCert: options.sslCert ? (0, path_1.join)(devkit_1.workspaceRoot, options.sslCert) : undefined,
        sslKey: options.sslKey ? (0, path_1.join)(devkit_1.workspaceRoot, options.sslKey) : undefined,
    };
}
function getBuildOptions(buildTarget, context) {
    const target = (0, devkit_1.parseTargetString)(buildTarget, context);
    const buildOptions = (0, devkit_1.readTargetOptions)(target, context);
    return {
        ...buildOptions,
    };
}
