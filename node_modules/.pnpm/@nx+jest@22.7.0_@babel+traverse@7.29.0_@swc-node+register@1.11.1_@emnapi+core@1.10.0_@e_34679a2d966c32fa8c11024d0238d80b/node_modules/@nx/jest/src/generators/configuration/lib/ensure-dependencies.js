"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDependencies = ensureDependencies;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../../utils/versions");
function ensureDependencies(tree, options) {
    const { babelJestVersion, jestTypesVersion, jestVersion, nxVersion, swcJestVersion, tsJestVersion, tslibVersion, tsNodeVersion, typesNodeVersion, } = (0, versions_1.versions)(tree);
    const dependencies = {
        tslib: tslibVersion,
    };
    const devDeps = {
        // because the default jest-preset uses ts-jest,
        // jest will throw an error if it's not installed
        // even if not using it in overriding transformers
        'ts-jest': tsJestVersion,
        // peer dependency of ts-jest
        'jest-util': jestVersion,
    };
    if (options.testEnvironment !== 'none') {
        devDeps[`jest-environment-${options.testEnvironment}`] = jestVersion;
    }
    if (!options.js) {
        devDeps['ts-node'] = tsNodeVersion;
        devDeps['@types/jest'] = jestTypesVersion;
        devDeps['@types/node'] = typesNodeVersion;
    }
    if (options.compiler === 'babel' || options.babelJest) {
        devDeps['babel-jest'] = babelJestVersion;
        // in some cases @nx/js will not already be present i.e. node only projects
        devDeps['@nx/js'] = nxVersion;
    }
    else if (options.compiler === 'swc') {
        devDeps['@swc/jest'] = swcJestVersion;
    }
    return (0, devkit_1.addDependenciesToPackageJson)(tree, dependencies, devDeps, undefined, options.keepExistingVersions);
}
