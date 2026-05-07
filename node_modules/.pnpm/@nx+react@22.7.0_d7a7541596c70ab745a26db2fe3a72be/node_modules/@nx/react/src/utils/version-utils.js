"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReactDependenciesVersionsToInstall = getReactDependenciesVersionsToInstall;
exports.isReact18 = isReact18;
exports.getInstalledReactVersion = getInstalledReactVersion;
exports.getInstalledReactVersionFromGraph = getInstalledReactVersionFromGraph;
exports.getInstalledReactRouterDevVersion = getInstalledReactRouterDevVersion;
exports.reactRouterSupportsVite8 = reactRouterSupportsVite8;
const devkit_1 = require("@nx/devkit");
const semver_1 = require("semver");
const versions_1 = require("./versions");
async function getReactDependenciesVersionsToInstall(tree) {
    if (await isReact18(tree)) {
        return {
            react: versions_1.reactV18Version,
            'react-dom': versions_1.reactDomV18Version,
            'react-is': versions_1.reactIsV18Version,
            '@types/react': versions_1.typesReactV18Version,
            '@types/react-dom': versions_1.typesReactDomV18Version,
            '@types/react-is': versions_1.typesReactIsV18Version,
        };
    }
    else {
        return {
            react: versions_1.reactVersion,
            'react-dom': versions_1.reactDomVersion,
            'react-is': versions_1.reactIsVersion,
            '@types/react': versions_1.typesReactVersion,
            '@types/react-dom': versions_1.typesReactDomVersion,
            '@types/react-is': versions_1.typesReactIsVersion,
        };
    }
}
async function isReact18(tree) {
    let installedReactVersion = await getInstalledReactVersionFromGraph();
    if (!installedReactVersion) {
        installedReactVersion = getInstalledReactVersion(tree);
    }
    return (0, semver_1.major)(installedReactVersion) === 18;
}
function getInstalledReactVersion(tree) {
    const installedReactVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'react');
    if (!installedReactVersion ||
        installedReactVersion === 'latest' ||
        installedReactVersion === 'next') {
        return (0, semver_1.clean)(versions_1.reactVersion) ?? (0, semver_1.coerce)(versions_1.reactVersion).version;
    }
    return (0, semver_1.clean)(installedReactVersion) ?? (0, semver_1.coerce)(installedReactVersion).version;
}
async function getInstalledReactVersionFromGraph() {
    const graph = await (0, devkit_1.createProjectGraphAsync)();
    const reactDep = graph.externalNodes?.['npm:react'];
    if (!reactDep) {
        return undefined;
    }
    return (0, semver_1.clean)(reactDep.data.version) ?? (0, semver_1.coerce)(reactDep.data.version).version;
}
function getInstalledReactRouterDevVersion(tree) {
    const installed = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, '@react-router/dev');
    if (!installed || installed === 'latest' || installed === 'next') {
        return undefined;
    }
    return (0, semver_1.clean)(installed) ?? (0, semver_1.coerce)(installed)?.version;
}
function reactRouterSupportsVite8(tree) {
    const installed = getInstalledReactRouterDevVersion(tree);
    if (!installed) {
        return true;
    }
    const coerced = (0, semver_1.coerce)(installed);
    if (!coerced) {
        return true;
    }
    return coerced.major > 7 || (coerced.major === 7 && coerced.minor >= 14);
}
