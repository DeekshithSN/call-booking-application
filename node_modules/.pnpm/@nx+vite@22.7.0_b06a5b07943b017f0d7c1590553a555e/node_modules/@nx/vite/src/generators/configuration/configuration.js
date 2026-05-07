"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viteConfigurationGenerator = viteConfigurationGenerator;
exports.viteConfigurationGeneratorInternal = viteConfigurationGeneratorInternal;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const get_import_path_1 = require("@nx/js/src/utils/get-import-path");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const posix_1 = require("node:path/posix");
const ensure_dependencies_1 = require("../../utils/ensure-dependencies");
const generator_utils_1 = require("../../utils/generator-utils");
const init_1 = tslib_1.__importDefault(require("../init/init"));
const vitest_generator_1 = tslib_1.__importDefault(require("../vitest/vitest-generator"));
const convert_non_vite_1 = require("./lib/convert-non-vite");
function viteConfigurationGenerator(host, schema) {
    return viteConfigurationGeneratorInternal(host, {
        addPlugin: false,
        ...schema,
    });
}
async function viteConfigurationGeneratorInternal(tree, schema) {
    const tasks = [];
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, schema.project);
    const { targets, root: projectRoot } = projectConfig;
    const projectType = (0, ts_solution_setup_1.getProjectType)(tree, projectConfig.root, schema.projectType ?? projectConfig.projectType);
    schema.includeLib ??= projectType === 'library';
    // Setting default to jsdom since it is the most common use case (React, Web).
    // The @nx/js:lib generator specifically sets this to node to be more generic.
    schema.testEnvironment ??= 'jsdom';
    /**
     * This is for when we are converting an existing project
     * to use the vite executors.
     */
    let projectAlreadyHasViteTargets = {};
    if (!schema.newProject) {
        await (0, convert_non_vite_1.convertNonVite)(tree, schema, projectRoot, projectType, targets);
    }
    const jsInitTask = await (0, js_1.initGenerator)(tree, {
        ...schema,
        skipFormat: true,
        tsConfigName: projectRoot === '.' ? 'tsconfig.json' : 'tsconfig.base.json',
    });
    tasks.push(jsInitTask);
    const initTask = await (0, init_1.default)(tree, {
        ...schema,
        projectRoot,
        skipFormat: true,
    });
    tasks.push(initTask);
    tasks.push((0, ensure_dependencies_1.ensureDependencies)(tree, schema));
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const addPluginDefault = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    schema.addPlugin ??= addPluginDefault;
    const hasPlugin = nxJson.plugins?.some((p) => typeof p === 'string'
        ? p === '@nx/vite/plugin'
        : p.plugin === '@nx/vite/plugin');
    if (!hasPlugin) {
        if (!projectAlreadyHasViteTargets.build) {
            (0, generator_utils_1.addBuildTarget)(tree, schema, 'build');
        }
        if (!schema.includeLib) {
            if (!projectAlreadyHasViteTargets.serve) {
                (0, generator_utils_1.addServeTarget)(tree, schema, 'serve');
            }
            if (!projectAlreadyHasViteTargets.preview) {
                (0, generator_utils_1.addPreviewTarget)(tree, schema, 'preview');
            }
        }
    }
    if (projectType === 'library') {
        // update tsconfig.lib.json to include vite/client
        (0, devkit_1.updateJson)(tree, (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.lib.json'), (json) => {
            json.compilerOptions ??= {};
            json.compilerOptions.types ??= [];
            if (!json.compilerOptions.types.includes('vite/client')) {
                json.compilerOptions.types.push('vite/client');
            }
            return json;
        });
    }
    if (!schema.newProject) {
        // We are converting existing project to use Vite
        if (schema.uiFramework === 'react') {
            (0, generator_utils_1.createOrEditViteConfig)(tree, {
                project: schema.project,
                includeLib: schema.includeLib,
                includeVitest: schema.includeVitest,
                inSourceTests: schema.inSourceTests,
                rollupOptionsExternal: [
                    "'react'",
                    "'react-dom'",
                    "'react/jsx-runtime'",
                ],
                imports: [
                    schema.compiler === 'swc'
                        ? `import react from '@vitejs/plugin-react-swc'`
                        : `import react from '@vitejs/plugin-react'`,
                ],
                plugins: ['react()'],
                port: schema.port,
                useEsmExtension: true,
            }, false, undefined);
        }
        else {
            (0, generator_utils_1.createOrEditViteConfig)(tree, { ...schema, useEsmExtension: true }, false, projectAlreadyHasViteTargets);
        }
    }
    if (schema.includeVitest) {
        const vitestTask = await (0, vitest_generator_1.default)(tree, {
            project: schema.project,
            uiFramework: schema.uiFramework,
            inSourceTests: schema.inSourceTests,
            coverageProvider: 'v8',
            skipViteConfig: true,
            testTarget: 'test',
            skipFormat: true,
            addPlugin: schema.addPlugin,
            compiler: schema.compiler,
            projectType,
        }, false, true);
        tasks.push(vitestTask);
    }
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree)) {
        updatePackageJson(tree, schema, projectType);
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = viteConfigurationGenerator;
function updatePackageJson(tree, options, projectType) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const packageJsonPath = (0, posix_1.join)(project.root, 'package.json');
    let packageJson;
    if (tree.exists(packageJsonPath)) {
        packageJson = (0, devkit_1.readJson)(tree, packageJsonPath);
    }
    else {
        packageJson = {
            name: (0, get_import_path_1.getImportPath)(tree, options.project),
            version: '0.0.1',
        };
        if ((0, ts_solution_setup_1.getProjectType)(tree, project.root, projectType) === 'application') {
            packageJson.private = true;
        }
    }
    if (projectType === 'library') {
        // we always write/override the vite and project config with some set values,
        // so we can rely on them
        const main = (0, posix_1.join)(project.root, 'src/index.ts');
        // we configure the dts plugin with the entryRoot set to `src`
        const rootDir = (0, posix_1.join)(project.root, 'src');
        const outputPath = (0, devkit_1.joinPathFragments)(project.root, 'dist');
        packageJson = (0, js_1.getUpdatedPackageJsonContent)(packageJson, {
            main,
            outputPath,
            projectRoot: project.root,
            rootDir,
            generateExportsField: true,
            packageJsonPath,
            format: ['esm'],
            developmentConditionName: (0, ts_solution_setup_1.getDefinedCustomConditionName)(tree),
        });
    }
    (0, devkit_1.writeJson)(tree, packageJsonPath, packageJson);
}
