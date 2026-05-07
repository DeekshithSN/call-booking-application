"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNxJsonSettings = updateNxJsonSettings;
exports.initGenerator = initGenerator;
exports.initGeneratorInternal = initGeneratorInternal;
const devkit_1 = require("@nx/devkit");
const add_plugin_1 = require("@nx/devkit/src/utils/add-plugin");
const setup_paths_plugin_1 = require("../setup-paths-plugin/setup-paths-plugin");
const plugin_1 = require("../../plugins/plugin");
const utils_1 = require("./lib/utils");
const ignore_vite_temp_files_1 = require("../../utils/ignore-vite-temp-files");
function updateNxJsonSettings(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const productionFileSet = nxJson.namedInputs?.production;
    if (productionFileSet) {
        productionFileSet.push('!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)', '!{projectRoot}/tsconfig.spec.json', '!{projectRoot}/src/test-setup.[jt]s');
        nxJson.namedInputs.production = Array.from(new Set(productionFileSet));
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
}
function initGenerator(tree, schema) {
    return initGeneratorInternal(tree, { addPlugin: false, ...schema });
}
async function initGeneratorInternal(tree, schema) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const addPluginDefault = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    schema.addPlugin ??= addPluginDefault;
    if (schema.addPlugin) {
        await (0, add_plugin_1.addPlugin)(tree, await (0, devkit_1.createProjectGraphAsync)(), '@nx/vite/plugin', plugin_1.createNodesV2, {
            buildTargetName: ['build', 'vite:build', 'vite-build'],
            testTargetName: ['test', 'vite:test', 'vite-test'],
            serveTargetName: ['serve', 'vite:serve', 'vite-serve'],
            devTargetName: ['dev', 'vite:dev', 'vite-dev'],
            previewTargetName: ['preview', 'vite:preview', 'vite-preview'],
            serveStaticTargetName: [
                'serve-static',
                'vite:serve-static',
                'vite-serve-static',
            ],
            typecheckTargetName: ['typecheck', 'vite:typecheck', 'vite-typecheck'],
            buildDepsTargetName: [
                'build-deps',
                'vite:build-deps',
                'vite-build-deps',
            ],
            watchDepsTargetName: [
                'watch-deps',
                'vite:watch-deps',
                'vite-watch-deps',
            ],
        }, schema.updatePackageScripts);
    }
    updateNxJsonSettings(tree);
    await (0, ignore_vite_temp_files_1.ignoreViteTempFiles)(tree, schema.projectRoot);
    if (schema.setupPathsPlugin) {
        await (0, setup_paths_plugin_1.setupPathsPlugin)(tree, { skipFormat: true });
    }
    const tasks = [];
    if (!schema.skipPackageJson) {
        tasks.push((0, utils_1.moveToDevDependencies)(tree));
        tasks.push(await (0, utils_1.checkDependenciesInstalled)(tree, schema));
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = initGenerator;
