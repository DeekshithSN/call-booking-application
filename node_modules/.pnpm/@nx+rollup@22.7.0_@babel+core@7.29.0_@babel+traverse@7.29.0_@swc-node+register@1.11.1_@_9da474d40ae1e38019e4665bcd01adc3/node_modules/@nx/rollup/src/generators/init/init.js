"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollupInitGenerator = rollupInitGenerator;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../utils/versions");
const add_plugin_1 = require("@nx/devkit/src/utils/add-plugin");
const plugin_1 = require("../../plugins/plugin");
async function rollupInitGenerator(tree, schema) {
    let task = () => { };
    const nxJson = (0, devkit_1.readNxJson)(tree);
    schema.addPlugin ??=
        process.env.NX_ADD_PLUGINS !== 'false' &&
            nxJson.useInferencePlugins !== false;
    if (!schema.skipPackageJson) {
        const devDependencies = { '@nx/rollup': versions_1.nxVersion };
        if (schema.addPlugin) {
            // Ensure user can run Rollup CLI.
            devDependencies['rollup'] = versions_1.rollupVersion;
        }
        task = (0, devkit_1.addDependenciesToPackageJson)(tree, {}, devDependencies, undefined, schema.keepExistingVersions);
    }
    if (schema.addPlugin) {
        await (0, add_plugin_1.addPlugin)(tree, await (0, devkit_1.createProjectGraphAsync)(), '@nx/rollup/plugin', plugin_1.createNodesV2, {
            buildTargetName: ['build', 'rollup:build', 'rollup-build'],
            buildDepsTargetName: [
                'build-deps',
                'rollup:build-deps',
                'rollup-build-deps',
            ],
            watchDepsTargetName: [
                'watch-deps',
                'rollup:watch-deps',
                'rollup-watch-deps',
            ],
        }, schema.updatePackageScripts);
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return task;
}
exports.default = rollupInitGenerator;
