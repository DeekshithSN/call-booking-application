"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGenerator = initGenerator;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../utils/versions");
function updateDependencies(tree, options) {
    const tasks = [];
    tasks.push((0, devkit_1.removeDependenciesFromPackageJson)(tree, ['@nx/node'], []));
    tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {}, { '@nx/node': versions_1.nxVersion }, undefined, options.keepExistingVersions));
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
async function initGenerator(tree, options) {
    let installTask = () => { };
    if (!options.skipPackageJson) {
        installTask = updateDependencies(tree, options);
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return installTask;
}
exports.default = initGenerator;
