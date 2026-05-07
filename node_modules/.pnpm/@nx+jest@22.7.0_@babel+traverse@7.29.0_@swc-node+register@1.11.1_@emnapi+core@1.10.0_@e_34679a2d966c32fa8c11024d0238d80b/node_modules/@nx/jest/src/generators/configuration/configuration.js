"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurationGenerator = configurationGenerator;
exports.configurationGeneratorInternal = configurationGeneratorInternal;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const config_file_1 = require("../../utils/config/config-file");
const init_1 = require("../init/init");
const check_for_test_target_1 = require("./lib/check-for-test-target");
const create_files_1 = require("./lib/create-files");
const create_jest_config_1 = require("./lib/create-jest-config");
const ensure_dependencies_1 = require("./lib/ensure-dependencies");
const update_tsconfig_1 = require("./lib/update-tsconfig");
const update_vscode_recommended_extensions_1 = require("./lib/update-vscode-recommended-extensions");
const update_workspace_1 = require("./lib/update-workspace");
const schemaDefaults = {
    setupFile: 'none',
    babelJest: false,
    supportTsx: false,
    skipSetupFile: false,
    skipSerializers: false,
    testEnvironment: 'jsdom',
};
function normalizeOptions(tree, options) {
    if (!options.testEnvironment) {
        options.testEnvironment = 'jsdom';
    }
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const addPlugin = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    options.addPlugin ??= addPlugin;
    options.targetName ??= 'test';
    if (!options.hasOwnProperty('supportTsx')) {
        options.supportTsx = false;
    }
    // if we support TSX or compiler is not tsc, then we don't support angular(html templates)
    if (options.supportTsx ||
        options.babelJest ||
        ['swc', 'babel'].includes(options.compiler)) {
        options.skipSerializers = true;
    }
    if (options.skipSetupFile) {
        // setupFile is always 'none'
        options.setupFile = schemaDefaults.setupFile;
    }
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    return {
        ...schemaDefaults,
        ...options,
        keepExistingVersions: options.keepExistingVersions ?? true,
        rootProject: project.root === '.' || project.root === '',
        isTsSolutionSetup: (0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree),
    };
}
function configurationGenerator(tree, schema) {
    return configurationGeneratorInternal(tree, { addPlugin: false, ...schema });
}
async function configurationGeneratorInternal(tree, schema) {
    const options = normalizeOptions(tree, schema);
    // we'll only add the vscode recommended extension if the jest preset does
    // not exist, which most likely means this is a first run, in the cases it's
    // not a first run, we'll skip adding it but it's not a critical thing to do
    const shouldAddVsCodeRecommendations = (0, config_file_1.findRootJestPreset)(tree) === null;
    const tasks = [];
    tasks.push(await (0, js_1.initGenerator)(tree, { ...schema, skipFormat: true }));
    tasks.push(await (0, init_1.jestInitGenerator)(tree, { ...options, skipFormat: true }));
    if (!schema.skipPackageJson) {
        tasks.push((0, ensure_dependencies_1.ensureDependencies)(tree, options));
    }
    const presetExt = (0, config_file_1.getPresetExt)(tree);
    await (0, create_jest_config_1.createJestConfig)(tree, options, presetExt);
    (0, check_for_test_target_1.checkForTestTarget)(tree, options);
    (0, create_files_1.createFiles)(tree, options, presetExt);
    (0, update_tsconfig_1.updateTsConfig)(tree, options);
    if (shouldAddVsCodeRecommendations) {
        (0, update_vscode_recommended_extensions_1.updateVsCodeRecommendedExtensions)(tree);
    }
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const hasPlugin = nxJson.plugins?.some((p) => {
        if (typeof p === 'string') {
            return p === '@nx/jest/plugin' && options.targetName === 'test';
        }
        else {
            return (p.plugin === '@nx/jest/plugin' &&
                (p.options?.targetName ?? 'test') ===
                    options.targetName);
        }
    });
    if (!hasPlugin || options.addExplicitTargets) {
        (0, update_workspace_1.updateWorkspace)(tree, options);
    }
    if (options.isTsSolutionSetup) {
        ignoreTestOutput(tree);
        // in the TS solution setup, the test target depends on the build outputs
        // so we need to setup the task pipeline accordingly
        const nxJson = (0, devkit_1.readNxJson)(tree);
        nxJson.targetDefaults ??= {};
        nxJson.targetDefaults[options.targetName] ??= {};
        nxJson.targetDefaults[options.targetName].dependsOn ??= [];
        nxJson.targetDefaults[options.targetName].dependsOn.push('^build');
        nxJson.targetDefaults[options.targetName].dependsOn = Array.from(new Set(nxJson.targetDefaults[options.targetName].dependsOn));
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
function ignoreTestOutput(tree) {
    if (!tree.exists('.gitignore')) {
        devkit_1.logger.warn(`Couldn't find a root .gitignore file to update.`);
    }
    let content = tree.read('.gitignore', 'utf-8');
    if (/^test-output$/gm.test(content)) {
        return;
    }
    content = `${content}\ntest-output\n`;
    tree.write('.gitignore', content);
}
exports.default = configurationGenerator;
