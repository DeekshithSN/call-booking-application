"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildOptions = getBuildOptions;
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
function getBuildOptions(buildTarget, context) {
    const target = (0, devkit_1.parseTargetString)(buildTarget, context);
    const buildOptions = (0, devkit_1.readTargetOptions)(target, context);
    return {
        ...buildOptions,
    };
}
function normalizeOptions(options) {
    return {
        ...options,
        devRemotes: options.devRemotes ?? [],
        verbose: options.verbose ?? false,
    };
}
