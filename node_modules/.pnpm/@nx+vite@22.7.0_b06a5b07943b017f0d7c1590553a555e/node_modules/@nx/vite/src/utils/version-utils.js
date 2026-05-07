"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVitestDependenciesVersionsToInstall = getVitestDependenciesVersionsToInstall;
exports.isVitestV3 = isVitestV3;
exports.isVitestV2 = isVitestV2;
exports.getInstalledVitestVersion = getInstalledVitestVersion;
exports.getInstalledViteVersion = getInstalledViteVersion;
exports.getInstalledViteMajorVersion = getInstalledViteMajorVersion;
exports.getInstalledVitestVersionFromGraph = getInstalledVitestVersionFromGraph;
const devkit_1 = require("@nx/devkit");
const semver_1 = require("semver");
const versions_1 = require("./versions");
async function getVitestDependenciesVersionsToInstall(tree) {
    if (await isVitestV3(tree)) {
        return {
            vitest: versions_1.vitestV3Version,
            vitestCoverageV8: versions_1.vitestV3CoverageV8Version,
            vitestCoverageIstanbul: versions_1.vitestV3CoverageIstanbulVersion,
        };
    }
    else if (await isVitestV2(tree)) {
        return {
            vitest: versions_1.vitestV2Version,
            vitestCoverageV8: versions_1.vitestV2CoverageV8Version,
            vitestCoverageIstanbul: versions_1.vitestV2CoverageIstanbulVersion,
        };
    }
    else {
        // Default to latest (v4)
        return {
            vitest: versions_1.vitestVersion,
            vitestCoverageV8: versions_1.vitestCoverageV8Version,
            vitestCoverageIstanbul: versions_1.vitestCoverageIstanbulVersion,
        };
    }
}
async function isVitestV3(tree) {
    let installedVitestVersion = await getInstalledVitestVersionFromGraph();
    if (!installedVitestVersion) {
        installedVitestVersion = getInstalledVitestVersion(tree);
    }
    return (0, semver_1.major)(installedVitestVersion) === 3;
}
async function isVitestV2(tree) {
    let installedVitestVersion = await getInstalledVitestVersionFromGraph();
    if (!installedVitestVersion) {
        installedVitestVersion = getInstalledVitestVersion(tree);
    }
    return (0, semver_1.major)(installedVitestVersion) === 2;
}
function getInstalledVitestVersion(tree) {
    const installedVitestVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'vitest');
    if (!installedVitestVersion ||
        installedVitestVersion === 'latest' ||
        installedVitestVersion === 'beta') {
        return (0, semver_1.clean)(versions_1.vitestVersion) ?? (0, semver_1.coerce)(versions_1.vitestVersion).version;
    }
    return ((0, semver_1.clean)(installedVitestVersion) ?? (0, semver_1.coerce)(installedVitestVersion).version);
}
function getInstalledViteVersion(tree) {
    const installedViteVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'vite');
    if (!installedViteVersion ||
        installedViteVersion === 'latest' ||
        installedViteVersion === 'beta') {
        return undefined;
    }
    return (0, semver_1.clean)(installedViteVersion) ?? (0, semver_1.coerce)(installedViteVersion)?.version;
}
function getInstalledViteMajorVersion(tree) {
    const installedViteVersion = getInstalledViteVersion(tree);
    if (!installedViteVersion) {
        return undefined;
    }
    const installedMajor = (0, semver_1.major)(installedViteVersion);
    if (installedMajor < 5 || installedMajor > 8) {
        return undefined;
    }
    return installedMajor;
}
async function getInstalledVitestVersionFromGraph() {
    const graph = await (0, devkit_1.createProjectGraphAsync)();
    const vitestDep = graph.externalNodes?.['npm:vitest'];
    if (!vitestDep) {
        return undefined;
    }
    return ((0, semver_1.clean)(vitestDep.data.version) ?? (0, semver_1.coerce)(vitestDep.data.version).version);
}
