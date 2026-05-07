"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDependencies = ensureDependencies;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("@nx/js/src/utils/versions");
const versions_2 = require("./versions");
function ensureDependencies(tree, options) {
    switch (options.compiler) {
        case 'swc':
            return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
                '@swc/helpers': versions_1.swcHelpersVersion,
                '@swc/core': versions_1.swcCoreVersion,
                'swc-loader': versions_2.swcLoaderVersion,
            });
        case 'babel':
            return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
                'core-js': versions_2.coreJsVersion, // needed for preset-env to work
                tslib: versions_2.tsLibVersion,
            });
        default:
            return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { tslib: versions_2.tsLibVersion });
    }
}
