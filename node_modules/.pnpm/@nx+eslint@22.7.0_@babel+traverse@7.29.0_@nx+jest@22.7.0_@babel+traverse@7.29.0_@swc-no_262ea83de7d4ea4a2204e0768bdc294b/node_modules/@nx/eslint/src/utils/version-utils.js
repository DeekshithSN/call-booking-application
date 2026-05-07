"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledPackageVersion = getInstalledPackageVersion;
exports.getInstalledEslintVersion = getInstalledEslintVersion;
exports.getTypeScriptEslintVersionToInstall = getTypeScriptEslintVersionToInstall;
const devkit_1 = require("@nx/devkit");
const semver_1 = require("@nx/devkit/src/utils/semver");
const devkit_internals_1 = require("nx/src/devkit-internals");
const semver_2 = require("semver");
const versions_1 = require("./versions");
function getInstalledPackageVersion(pkgName, tree) {
    try {
        const packageJson = (0, devkit_internals_1.readModulePackageJson)(pkgName).packageJson;
        return packageJson.version;
    }
    catch { }
    // the package is not installed on disk, it could be in the package.json
    // but waiting to be installed
    let pkgVersionInRootPackageJson;
    if (tree) {
        pkgVersionInRootPackageJson = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, pkgName);
    }
    else {
        // Use filesystem-based signature for pnpm catalog compatibility
        pkgVersionInRootPackageJson = (0, devkit_1.getDependencyVersionFromPackageJson)(pkgName);
    }
    if (!pkgVersionInRootPackageJson) {
        // the package is not installed
        return null;
    }
    try {
        // try to parse and return the version
        return tree
            ? (0, semver_1.checkAndCleanWithSemver)(tree, pkgName, pkgVersionInRootPackageJson)
            : (0, semver_1.checkAndCleanWithSemver)(pkgName, pkgVersionInRootPackageJson);
    }
    catch { }
    // we could not resolve the version
    return null;
}
function getInstalledEslintVersion(tree) {
    return getInstalledPackageVersion('eslint', tree);
}
function getTypeScriptEslintVersionToInstall(tree) {
    const eslintVersion = getInstalledEslintVersion(tree);
    return eslintVersion && (0, semver_2.lt)(eslintVersion, '9.0.0')
        ? versions_1.typescriptESLintVersion
        : versions_1.eslint9__typescriptESLintVersion;
}
