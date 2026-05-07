"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDependencies = updateDependencies;
exports.updateNxJsonSettings = updateNxJsonSettings;
exports.initGenerator = initGenerator;
const devkit_1 = require("@nx/devkit");
const add_plugin_1 = require("@nx/devkit/src/utils/add-plugin");
const versions_1 = require("../../utils/versions");
const plugin_1 = require("../../plugins/plugin");
const version_utils_1 = require("../../utils/version-utils");
const ignore_vitest_temp_files_1 = require("../../utils/ignore-vitest-temp-files");
function updateDependencies(tree, schema) {
    // Determine which vite version to install:
    // 1. Explicit viteVersion flag takes priority
    // 2. If vite is already installed, keep the matching major version
    // 3. Otherwise, use the latest default (^8.0.0)
    const installedMajor = schema.viteVersion ?? (0, version_utils_1.getInstalledViteMajorVersion)(tree);
    const viteVersionToUse = installedMajor === 5
        ? versions_1.viteV5Version
        : installedMajor === 6
            ? versions_1.viteV6Version
            : installedMajor === 7
                ? versions_1.viteV7Version
                : versions_1.viteVersion;
    return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
        '@nx/vitest': versions_1.nxVersion,
        vitest: versions_1.vitestVersion,
        vite: viteVersionToUse,
    }, undefined, schema.keepExistingVersions);
}
function updateNxJsonSettings(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const productionFileSet = nxJson.namedInputs?.production;
    if (productionFileSet) {
        productionFileSet.push('!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)', '!{projectRoot}/tsconfig.spec.json');
        nxJson.namedInputs.production = Array.from(new Set(productionFileSet));
    }
    const hasPlugin = nxJson.plugins?.some((p) => typeof p === 'string' ? p === '@nx/vitest' : p.plugin === '@nx/vitest');
    if (!hasPlugin) {
        nxJson.targetDefaults ??= {};
        nxJson.targetDefaults['@nx/vitest:test'] ??= {};
        nxJson.targetDefaults['@nx/vitest:test'].cache ??= true;
        nxJson.targetDefaults['@nx/vitest:test'].inputs ??= [
            'default',
            productionFileSet ? '^production' : '^default',
        ];
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
}
async function initGenerator(tree, schema) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const addPluginDefault = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    schema.addPlugin ??= addPluginDefault;
    if (schema.addPlugin) {
        await (0, add_plugin_1.addPlugin)(tree, await (0, devkit_1.createProjectGraphAsync)(), '@nx/vitest', plugin_1.createNodesV2, {
            testTargetName: ['test', 'vitest:test', 'vitest-test'],
            ciTargetName: ['test-ci', 'vitest:test-ci', 'vitest-test-ci'],
        }, schema.updatePackageScripts);
    }
    updateNxJsonSettings(tree);
    await (0, ignore_vitest_temp_files_1.ignoreVitestTempFiles)(tree, schema.projectRoot);
    const tasks = [];
    if (!schema.skipPackageJson) {
        tasks.push(updateDependencies(tree, schema));
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = initGenerator;
