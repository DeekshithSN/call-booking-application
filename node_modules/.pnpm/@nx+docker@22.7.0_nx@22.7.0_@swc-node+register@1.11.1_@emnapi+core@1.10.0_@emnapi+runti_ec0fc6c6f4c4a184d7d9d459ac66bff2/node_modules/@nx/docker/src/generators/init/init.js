"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDependencies = updateDependencies;
exports.initGenerator = initGenerator;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../utils/versions");
function updateDependencies(tree, schema) {
    return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
        '@nx/docker': versions_1.nxVersion,
    }, undefined, schema.keepExistingVersions);
}
function addPluginToNxJson(tree, updatePackageScripts) {
    if (!tree.exists('nx.json')) {
        devkit_1.logger.warn('"nx.json" not found. Skipping "@nx/docker" plugin registration.');
        return;
    }
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (!nxJson) {
        devkit_1.logger.warn('Unable to read "nx.json" content. Skipping "@nx/docker" plugin registration.');
        return;
    }
    nxJson.plugins ??= [];
    const pluginExists = nxJson.plugins.some((plugin) => typeof plugin === 'string'
        ? plugin === '@nx/docker'
        : plugin?.plugin === '@nx/docker');
    if (pluginExists) {
        devkit_1.logger.info('"@nx/docker" plugin is already registered in "nx.json".');
        return;
    }
    nxJson.plugins.push({
        plugin: '@nx/docker',
        options: {
            buildTarget: { name: 'docker:build' },
            runTarget: { name: 'docker:run' },
        },
    });
    (0, devkit_1.updateNxJson)(tree, nxJson);
    devkit_1.logger.info('Added "@nx/docker" to plugins array in "nx.json".');
}
async function initGenerator(tree, schema) {
    devkit_1.logger.warn(`Docker support is experimental. Breaking changes may occur and not adhere to semver versioning.`);
    const tasks = [];
    if (!schema.skipPackageJson && tree.exists('package.json')) {
        tasks.push(updateDependencies(tree, schema));
    }
    addPluginToNxJson(tree, schema.updatePackageScripts);
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = initGenerator;
