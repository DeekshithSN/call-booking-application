"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionMap = exports.latestVersions = void 0;
exports.versions = versions;
exports.getInstalledJestVersion = getInstalledJestVersion;
exports.getInstalledJestVersionInfo = getInstalledJestVersionInfo;
exports.getInstalledJestMajorVersion = getInstalledJestMajorVersion;
exports.validateInstalledJestVersion = validateInstalledJestVersion;
const devkit_1 = require("@nx/devkit");
const semver_1 = require("semver");
const nxVersion = require('../../package.json').version;
exports.latestVersions = {
    nxVersion,
    jestVersion: '^30.0.2',
    babelJestVersion: '^30.0.2',
    jestTypesVersion: '^30.0.0',
    tsJestVersion: '^29.4.0',
    tslibVersion: '^2.3.0',
    swcJestVersion: '~0.2.38',
    typesNodeVersion: '20.19.9',
    tsNodeVersion: '10.9.1',
};
const supportedMajorVersions = [29, 30];
const minSupportedMajorVersion = Math.min(...supportedMajorVersions);
const currentMajorVersion = Math.max(...supportedMajorVersions);
exports.versionMap = {
    29: {
        nxVersion,
        jestVersion: '^29.7.0',
        babelJestVersion: '^29.7.0',
        jestTypesVersion: '^29.5.12',
        tsJestVersion: '^29.1.0',
        tslibVersion: '^2.3.0',
        swcJestVersion: '~0.2.36',
        typesNodeVersion: '18.16.9',
        tsNodeVersion: '10.9.1',
    },
    30: exports.latestVersions,
};
function versions(tree) {
    const installedJestVersion = getInstalledJestVersion(tree);
    if (!installedJestVersion) {
        return exports.latestVersions;
    }
    const jestMajorVersion = (0, semver_1.major)(installedJestVersion);
    if (exports.versionMap[jestMajorVersion]) {
        return exports.versionMap[jestMajorVersion];
    }
    const backwardCompatibleVersions = supportedMajorVersions.slice(0, -1);
    throw new Error(`You're currently using an unsupported Jest version: ${installedJestVersion}. Supported major versions are ${backwardCompatibleVersions.join(', ')} and ${currentMajorVersion}.`);
}
function getInstalledJestVersion(tree) {
    try {
        let version;
        if (tree) {
            version = getJestVersionFromTree(tree);
        }
        else {
            version = getJestVersionFromFileSystem();
        }
        return version;
    }
    catch {
        return null;
    }
}
function getInstalledJestVersionInfo(tree) {
    const version = getInstalledJestVersion(tree);
    return version
        ? { version, major: (0, semver_1.major)(version) }
        : { version: null, major: null };
}
function getInstalledJestMajorVersion(tree) {
    const installedJestVersion = getInstalledJestVersion(tree);
    return installedJestVersion ? (0, semver_1.major)(installedJestVersion) : null;
}
function validateInstalledJestVersion(tree) {
    const { version, major } = getInstalledJestVersionInfo(tree);
    if (!version) {
        return;
    }
    if (major < minSupportedMajorVersion || major > currentMajorVersion) {
        const backwardCompatibleVersions = supportedMajorVersions.slice(0, -1);
        throw new Error(`You're currently using an unsupported Jest version: ${version}. Supported major versions are ${backwardCompatibleVersions.join(', ')} and ${currentMajorVersion}.`);
    }
}
function getJestVersionFromTree(tree) {
    const installedVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'jest');
    if (!installedVersion) {
        return null;
    }
    if (installedVersion === 'latest' || installedVersion === 'next') {
        return ((0, semver_1.clean)(exports.latestVersions.jestVersion) ??
            (0, semver_1.coerce)(exports.latestVersions.jestVersion)?.version);
    }
    return (0, semver_1.clean)(installedVersion) ?? (0, semver_1.coerce)(installedVersion)?.version;
}
function getJestVersionFromFileSystem() {
    try {
        const { getVersion } = require('jest');
        return getVersion();
    }
    catch { }
    return null;
}
