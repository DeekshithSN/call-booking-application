"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurationGenerator = configurationGenerator;
exports.configurationGeneratorInternal = configurationGeneratorInternal;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const versions_1 = require("@nx/js/src/utils/versions");
const path_1 = require("path");
const ensure_dependencies_1 = require("../../utils/ensure-dependencies");
const generator_utils_1 = require("../../utils/generator-utils");
const init_1 = tslib_1.__importDefault(require("../init/init"));
const detect_ui_framework_1 = require("../../utils/detect-ui-framework");
const version_utils_1 = require("../../utils/version-utils");
const semver_1 = require("semver");
/**
 * Determines whether to use vitest.config.mts instead of vite.config.mts.
 * Returns true for new non-framework projects that don't already have a vite.config.
 */
function shouldUseVitestConfig(tree, projectRoot, uiFramework) {
    // Keep vite.config for framework projects (need vite plugins like react, angular, etc.)
    if (uiFramework !== 'none') {
        return false;
    }
    // Keep existing vite.config (backwards compatibility)
    const extensions = ['ts', 'mts', 'js', 'mjs'];
    const hasExistingViteConfig = extensions.some((ext) => tree.exists((0, devkit_1.joinPathFragments)(projectRoot, `vite.config.${ext}`)));
    if (hasExistingViteConfig) {
        return false;
    }
    // New non-framework project → use vitest.config.mts
    return true;
}
/**
 * @param hasPlugin some frameworks (e.g. Nuxt) provide their own plugin. Their generators handle the plugin detection.
 */
function configurationGenerator(tree, schema, hasPlugin = false) {
    return configurationGeneratorInternal(tree, { addPlugin: false, ...schema }, hasPlugin);
}
async function configurationGeneratorInternal(tree, schema, hasPlugin = false) {
    // Setting default to jsdom since it is the most common use case (React, Web).
    // The @nx/js:lib generator specifically sets this to node to be more generic.
    schema.testEnvironment ??= 'jsdom';
    // Set the viteVersion to the installed version if it already exists in the workspace
    const installedViteVersion = (0, version_utils_1.getInstalledViteMajorVersion)(tree);
    schema.viteVersion ??= installedViteVersion;
    const tasks = [];
    const { root, projectType: _projectType } = (0, devkit_1.readProjectConfiguration)(tree, schema.project);
    const projectType = schema.projectType ?? _projectType;
    const uiFramework = schema.uiFramework ?? (await (0, detect_ui_framework_1.detectUiFramework)(schema.project));
    const isRootProject = root === '.';
    tasks.push(await (0, js_1.initGenerator)(tree, { ...schema, skipFormat: true }));
    const initTask = await (0, init_1.default)(tree, {
        skipFormat: true,
        addPlugin: schema.addPlugin,
        projectRoot: root,
        viteVersion: schema.viteVersion,
        skipPackageJson: schema.skipPackageJson,
        keepExistingVersions: true,
    });
    tasks.push(initTask);
    if (!schema.skipPackageJson) {
        tasks.push(await (0, ensure_dependencies_1.ensureDependencies)(tree, { ...schema, uiFramework }));
    }
    (0, generator_utils_1.addOrChangeTestTarget)(tree, schema, hasPlugin);
    if (!schema.skipViteConfig) {
        if (uiFramework === 'angular') {
            const relativeTestSetupPath = (0, devkit_1.joinPathFragments)('src', 'test-setup.ts');
            const setupFile = (0, devkit_1.joinPathFragments)(root, relativeTestSetupPath);
            if (!tree.exists(setupFile)) {
                const angularMajorVersion = getAngularMajorVersion(tree);
                const zoneless = schema.zoneless ?? isZonelessProject(tree, schema.project);
                if (angularMajorVersion >= 21) {
                    tree.write(setupFile, `import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

setupTestBed(${zoneless ? '' : '{ zoneless: false }'});
`);
                }
                else if (angularMajorVersion === 20) {
                    tree.write(setupFile, `import '@angular/compiler';
import '@analogjs/vitest-angular/${zoneless ? 'setup-snapshots' : 'setup-zone'}';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);
`);
                }
                else {
                    tree.write(setupFile, `import '@analogjs/vitest-angular/${zoneless ? 'setup-snapshots' : 'setup-zone'}';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { getTestBed } from '@angular/core/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
`);
                }
            }
            (0, generator_utils_1.createOrEditViteConfig)(tree, {
                project: schema.project,
                includeLib: false,
                includeVitest: true,
                inSourceTests: false,
                imports: [`import angular from '@analogjs/vite-plugin-angular'`],
                plugins: ['angular()'],
                setupFile: relativeTestSetupPath,
                useEsmExtension: true,
            }, true, { skipPackageJson: schema.skipPackageJson });
        }
        else if (uiFramework === 'react') {
            (0, generator_utils_1.createOrEditViteConfig)(tree, {
                project: schema.project,
                includeLib: (0, ts_solution_setup_1.getProjectType)(tree, root, projectType) === 'library',
                includeVitest: true,
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
                coverageProvider: schema.coverageProvider,
                useEsmExtension: true,
            }, true, { skipPackageJson: schema.skipPackageJson });
        }
        else {
            const useVitestConfig = shouldUseVitestConfig(tree, root, uiFramework);
            (0, generator_utils_1.createOrEditViteConfig)(tree, {
                ...schema,
                includeVitest: true,
                includeLib: (0, ts_solution_setup_1.getProjectType)(tree, root, projectType) === 'library',
                useEsmExtension: true,
            }, true, {
                vitestFileName: useVitestConfig,
                skipPackageJson: schema.skipPackageJson,
            });
        }
    }
    const isTsSolutionSetup = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree);
    createFiles(tree, schema, root, isTsSolutionSetup);
    updateTsConfig(tree, schema, root, projectType);
    if (isTsSolutionSetup) {
        // in the TS solution setup, the test target depends on the build outputs
        // so we need to setup the task pipeline accordingly
        const nxJson = (0, devkit_1.readNxJson)(tree);
        const testTarget = schema.testTarget ?? 'test';
        nxJson.targetDefaults ??= {};
        nxJson.targetDefaults[testTarget] ??= {};
        nxJson.targetDefaults[testTarget].dependsOn ??= [];
        nxJson.targetDefaults[testTarget].dependsOn = Array.from(new Set([...nxJson.targetDefaults[testTarget].dependsOn, '^build']));
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
    const devDependencies = await getCoverageProviderDependency(tree, schema.coverageProvider);
    devDependencies['@types/node'] = versions_1.typesNodeVersion;
    if (!schema.skipPackageJson) {
        const installDependenciesTask = (0, devkit_1.addDependenciesToPackageJson)(tree, {}, devDependencies, undefined, true);
        tasks.push(installDependenciesTask);
    }
    // Setup workspace config file (https://vitest.dev/guide/workspace.html)
    if (!isRootProject &&
        !tree.exists(`vitest.workspace.ts`) &&
        !tree.exists(`vitest.workspace.js`) &&
        !tree.exists(`vitest.workspace.json`) &&
        !tree.exists(`vitest.projects.ts`) &&
        !tree.exists(`vitest.projects.js`) &&
        !tree.exists(`vitest.projects.json`)) {
        tree.write('vitest.workspace.ts', `export default ['**/vite.config.{mjs,js,ts,mts}', '**/vitest.config.{mjs,js,ts,mts}'];`);
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
function updateTsConfig(tree, options, projectRoot, projectType) {
    const setupFile = tryFindSetupFile(tree, projectRoot);
    if (tree.exists((0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.spec.json'))) {
        (0, devkit_1.updateJson)(tree, (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.spec.json'), (json) => {
            if (!json.compilerOptions?.types?.includes('vitest')) {
                if (json.compilerOptions?.types) {
                    json.compilerOptions.types.push('vitest');
                }
                else {
                    json.compilerOptions ??= {};
                    json.compilerOptions.types = ['vitest'];
                }
            }
            if (setupFile) {
                json.files = [...(json.files ?? []), setupFile];
            }
            return json;
        });
        (0, devkit_1.updateJson)(tree, (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.json'), (json) => {
            if (json.references &&
                !json.references.some((r) => r.path === './tsconfig.spec.json')) {
                json.references.push({
                    path: './tsconfig.spec.json',
                });
            }
            return json;
        });
    }
    else {
        (0, devkit_1.updateJson)(tree, (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.json'), (json) => {
            if (!json.compilerOptions?.types?.includes('vitest')) {
                if (json.compilerOptions?.types) {
                    json.compilerOptions.types.push('vitest');
                }
                else {
                    json.compilerOptions ??= {};
                    json.compilerOptions.types = ['vitest'];
                }
            }
            return json;
        });
    }
    let runtimeTsconfigPath = (0, devkit_1.joinPathFragments)(projectRoot, (0, ts_solution_setup_1.getProjectType)(tree, projectRoot, projectType) === 'application'
        ? 'tsconfig.app.json'
        : 'tsconfig.lib.json');
    if (options.runtimeTsconfigFileName) {
        runtimeTsconfigPath = (0, devkit_1.joinPathFragments)(projectRoot, options.runtimeTsconfigFileName);
        if (!tree.exists(runtimeTsconfigPath)) {
            throw new Error(`Cannot find the specified runtimeTsConfigFileName ("${options.runtimeTsconfigFileName}") at the project root "${projectRoot}".`);
        }
    }
    if (tree.exists(runtimeTsconfigPath)) {
        (0, devkit_1.updateJson)(tree, runtimeTsconfigPath, (json) => {
            if (options.inSourceTests) {
                (json.compilerOptions.types ??= []).push('vitest/importMeta');
            }
            else {
                const uniqueExclude = new Set([
                    ...(json.exclude || []),
                    'vite.config.ts',
                    'vite.config.mts',
                    'vitest.config.ts',
                    'vitest.config.mts',
                    'src/**/*.test.ts',
                    'src/**/*.spec.ts',
                    'src/**/*.test.tsx',
                    'src/**/*.spec.tsx',
                    'src/**/*.test.js',
                    'src/**/*.spec.js',
                    'src/**/*.test.jsx',
                    'src/**/*.spec.jsx',
                ]);
                json.exclude = [...uniqueExclude];
            }
            if (setupFile) {
                json.exclude = [...(json.exclude ?? []), setupFile];
            }
            return json;
        });
    }
    else {
        devkit_1.logger.warn(`Couldn't find a runtime tsconfig file at ${runtimeTsconfigPath} to exclude the test files from. ` +
            `If you're using a different filename for your runtime tsconfig, please provide it with the '--runtimeTsconfigFileName' flag.`);
    }
}
function createFiles(tree, options, projectRoot, isTsSolutionSetup) {
    const rootOffset = (0, devkit_1.offsetFromRoot)(projectRoot);
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, 'files'), projectRoot, {
        tmpl: '',
        ...options,
        projectRoot,
        extendedConfig: isTsSolutionSetup
            ? `${rootOffset}tsconfig.base.json`
            : './tsconfig.json',
        outDir: isTsSolutionSetup
            ? `./out-tsc/vitest`
            : `${rootOffset}dist/out-tsc`,
    });
}
async function getCoverageProviderDependency(tree, coverageProvider) {
    const { vitestCoverageV8, vitestCoverageIstanbul } = await (0, version_utils_1.getVitestDependenciesVersionsToInstall)(tree);
    switch (coverageProvider) {
        case 'v8':
            return {
                '@vitest/coverage-v8': vitestCoverageV8,
            };
        case 'istanbul':
            return {
                '@vitest/coverage-istanbul': vitestCoverageIstanbul,
            };
        default:
            return {
                '@vitest/coverage-v8': vitestCoverageV8,
            };
    }
}
function tryFindSetupFile(tree, projectRoot) {
    const setupFile = (0, devkit_1.joinPathFragments)('src', 'test-setup.ts');
    if (tree.exists((0, devkit_1.joinPathFragments)(projectRoot, setupFile))) {
        return setupFile;
    }
}
function getAngularMajorVersion(tree) {
    const angularVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, '@angular/core');
    if (!angularVersion) {
        // assume the latest version will be installed
        return 21;
    }
    const cleanedAngularVersion = (0, semver_1.clean)(angularVersion) ?? (0, semver_1.coerce)(angularVersion)?.version;
    if (typeof cleanedAngularVersion !== 'string') {
        // assume the latest version will be installed
        return 21;
    }
    return (0, semver_1.major)(cleanedAngularVersion);
}
function isZonelessProject(tree, projectName) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, projectName);
    if (project.projectType === 'application') {
        const buildTarget = findBuildTarget(project);
        if (!buildTarget?.options?.polyfills) {
            return true;
        }
        const polyfills = buildTarget.options.polyfills;
        const polyfillsList = Array.isArray(polyfills) ? polyfills : [polyfills];
        return !polyfillsList.includes('zone.js');
    }
    // For libraries, check if zone.js is installed in the workspace
    return (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'zone.js') === null;
}
function findBuildTarget(project) {
    for (const target of Object.values(project.targets ?? {})) {
        if ([
            '@angular-devkit/build-angular:browser',
            '@angular-devkit/build-angular:browser-esbuild',
            '@angular-devkit/build-angular:application',
            '@angular/build:application',
            '@nx/angular:application',
            '@nx/angular:browser-esbuild',
            '@nx/angular:webpack-browser',
        ].includes(target.executor)) {
            return target;
        }
    }
    return project.targets?.build ?? null;
}
exports.default = configurationGenerator;
