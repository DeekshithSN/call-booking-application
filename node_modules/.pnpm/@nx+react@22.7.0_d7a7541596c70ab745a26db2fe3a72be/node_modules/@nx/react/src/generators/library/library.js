"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.libraryGenerator = libraryGenerator;
exports.libraryGeneratorInternal = libraryGeneratorInternal;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const artifact_name_and_directory_utils_1 = require("@nx/devkit/src/generators/artifact-name-and-directory-utils");
const log_show_project_command_1 = require("@nx/devkit/src/utils/log-show-project-command");
const js_1 = require("@nx/js");
const path_1 = require("path");
const add_release_config_1 = require("@nx/js/src/generators/library/utils/add-release-config");
const sort_fields_1 = require("@nx/js/src/utils/package-json/sort-fields");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const create_ts_config_1 = require("../../utils/create-ts-config");
const jest_utils_1 = require("../../utils/jest-utils");
const maybe_js_1 = require("../../utils/maybe-js");
const versions_1 = require("../../utils/versions");
const component_1 = tslib_1.__importDefault(require("../component/component"));
const init_1 = tslib_1.__importDefault(require("../init/init"));
const add_linting_1 = require("./lib/add-linting");
const add_rollup_build_target_1 = require("./lib/add-rollup-build-target");
const create_files_1 = require("./lib/create-files");
const determine_entry_fields_1 = require("./lib/determine-entry-fields");
const install_common_dependencies_1 = require("./lib/install-common-dependencies");
const normalize_options_1 = require("./lib/normalize-options");
const set_defaults_1 = require("./lib/set-defaults");
const update_app_routes_1 = require("./lib/update-app-routes");
async function libraryGenerator(host, schema) {
    return await libraryGeneratorInternal(host, {
        addPlugin: false,
        useProjectJson: true,
        ...schema,
    });
}
async function libraryGeneratorInternal(host, schema) {
    const tasks = [];
    const addTsPlugin = (0, ts_solution_setup_1.shouldConfigureTsSolutionSetup)(host, schema.addPlugin);
    const jsInitTask = await (0, js_1.initGenerator)(host, {
        ...schema,
        addTsPlugin,
        skipFormat: true,
    });
    tasks.push(jsInitTask);
    const options = await (0, normalize_options_1.normalizeOptions)(host, schema);
    if (options.publishable === true &&
        !options.isUsingTsSolutionConfig &&
        !schema.importPath) {
        throw new Error(`For publishable libs you have to provide a proper "--importPath" which needs to be a valid npm package name (e.g. my-awesome-lib or @myorg/my-lib)`);
    }
    if (!options.component) {
        options.style = 'none';
    }
    const initTask = await (0, init_1.default)(host, {
        ...options,
        skipFormat: true,
        useReactRouterPlugin: false,
    });
    tasks.push(initTask);
    const packageJson = {
        name: options.importPath,
        version: '0.0.1',
        ...(0, determine_entry_fields_1.determineEntryFields)(options),
        files: options.publishable ? ['dist', '!**/*.tsbuildinfo'] : undefined,
    };
    if (!options.useProjectJson) {
        if (options.name !== options.importPath) {
            packageJson.nx = { name: options.name };
        }
        if (options.parsedTags?.length) {
            packageJson.nx ??= {};
            packageJson.nx.tags = options.parsedTags;
        }
    }
    else {
        (0, devkit_1.addProjectConfiguration)(host, options.name, {
            root: options.projectRoot,
            sourceRoot: (0, devkit_1.joinPathFragments)(options.projectRoot, 'src'),
            projectType: 'library',
            tags: options.parsedTags,
            targets: {},
        });
    }
    if (!options.useProjectJson || options.isUsingTsSolutionConfig) {
        (0, devkit_1.writeJson)(host, `${options.projectRoot}/package.json`, packageJson);
    }
    (0, create_files_1.createFiles)(host, options);
    if (options.isUsingTsSolutionConfig) {
        await (0, ts_solution_setup_1.addProjectToTsSolutionWorkspace)(host, options.projectRoot);
    }
    const lintTask = await (0, add_linting_1.addLinting)(host, options);
    tasks.push(lintTask);
    // Set up build target
    if (options.buildable && options.bundler === 'vite') {
        const { viteConfigurationGenerator, createOrEditViteConfig } = (0, devkit_1.ensurePackage)('@nx/vite', versions_1.nxVersion);
        const viteTask = await viteConfigurationGenerator(host, {
            uiFramework: 'react',
            project: options.name,
            newProject: true,
            includeLib: true,
            inSourceTests: options.inSourceTests,
            includeVitest: options.unitTestRunner === 'vitest',
            compiler: options.compiler,
            skipFormat: true,
            testEnvironment: 'jsdom',
            addPlugin: options.addPlugin,
        });
        tasks.push(viteTask);
        createOrEditViteConfig(host, {
            project: options.name,
            includeLib: true,
            includeVitest: options.unitTestRunner === 'vitest',
            inSourceTests: options.inSourceTests,
            rollupOptionsExternal: [
                "'react'",
                "'react-dom'",
                "'react/jsx-runtime'",
            ],
            imports: [
                options.compiler === 'swc'
                    ? `import react from '@vitejs/plugin-react-swc'`
                    : `import react from '@vitejs/plugin-react'`,
            ],
            plugins: ['react()'],
            useEsmExtension: true,
        }, false);
    }
    else if (options.buildable && options.bundler === 'rollup') {
        const rollupTask = await (0, add_rollup_build_target_1.addRollupBuildTarget)(host, options);
        tasks.push(rollupTask);
    }
    // Set up test target
    if (options.unitTestRunner === 'jest') {
        const { configurationGenerator } = (0, devkit_1.ensurePackage)('@nx/jest', versions_1.nxVersion);
        const jestTask = await configurationGenerator(host, {
            ...options,
            project: options.name,
            setupFile: 'none',
            supportTsx: true,
            skipSerializers: true,
            compiler: options.compiler,
            skipFormat: true,
        });
        tasks.push(jestTask);
        const jestConfigPath = (0, devkit_1.joinPathFragments)(options.projectRoot, options.js ? 'jest.config.js' : 'jest.config.cts');
        if (options.compiler === 'babel' && host.exists(jestConfigPath)) {
            const updatedContent = (0, jest_utils_1.updateJestConfigContent)(host.read(jestConfigPath, 'utf-8'));
            host.write(jestConfigPath, updatedContent);
        }
    }
    else if (options.unitTestRunner === 'vitest' &&
        options.bundler !== 'vite' // tests are already configured if bundler is vite
    ) {
        const { createOrEditViteConfig } = (0, devkit_1.ensurePackage)('@nx/vite', versions_1.nxVersion);
        (0, devkit_1.ensurePackage)('@nx/vitest', versions_1.nxVersion);
        const { configurationGenerator } = await Promise.resolve().then(() => tslib_1.__importStar(require('@nx/vitest/generators')));
        const vitestTask = await configurationGenerator(host, {
            uiFramework: 'react',
            project: options.name,
            coverageProvider: 'v8',
            inSourceTests: options.inSourceTests,
            skipFormat: true,
            testEnvironment: 'jsdom',
            addPlugin: options.addPlugin,
            compiler: options.compiler,
        });
        tasks.push(vitestTask);
        createOrEditViteConfig(host, {
            project: options.name,
            includeLib: true,
            includeVitest: true,
            inSourceTests: options.inSourceTests,
            rollupOptionsExternal: [
                "'react'",
                "'react-dom'",
                "'react/jsx-runtime'",
            ],
            imports: [
                options.compiler === 'swc'
                    ? `import react from '@vitejs/plugin-react-swc'`
                    : `import react from '@vitejs/plugin-react'`,
            ],
            plugins: ['react()'],
            useEsmExtension: true,
        }, true);
    }
    if (options.component) {
        const relativeCwd = (0, artifact_name_and_directory_utils_1.getRelativeCwd)();
        const path = (0, devkit_1.joinPathFragments)(options.projectRoot, 'src/lib', options.fileName);
        const componentTask = await (0, component_1.default)(host, {
            path: relativeCwd ? (0, path_1.relative)(relativeCwd, path) : path,
            style: options.style,
            skipTests: options.unitTestRunner === 'none' ||
                (options.unitTestRunner === 'vitest' && options.inSourceTests == true),
            export: true,
            routing: options.routing,
            js: options.js,
            name: options.name,
            inSourceTests: options.inSourceTests,
            skipFormat: true,
            globalCss: options.globalCss,
        });
        tasks.push(componentTask);
    }
    if (options.publishable) {
        const projectConfiguration = (0, devkit_1.readProjectConfiguration)(host, options.name);
        if (options.isUsingTsSolutionConfig) {
            await (0, add_release_config_1.addReleaseConfigForTsSolution)(host, options.name, projectConfiguration);
        }
        else {
            const nxJson = (0, devkit_1.readNxJson)(host);
            await (0, add_release_config_1.addReleaseConfigForNonTsSolution)(host, options.name, projectConfiguration);
        }
        (0, devkit_1.updateProjectConfiguration)(host, options.name, projectConfiguration);
        tasks.push(await (0, add_release_config_1.releaseTasks)(host));
    }
    if (!options.skipPackageJson) {
        const installReactTask = await (0, install_common_dependencies_1.installCommonDependencies)(host, options);
        tasks.push(installReactTask);
    }
    const routeTask = (0, update_app_routes_1.updateAppRoutes)(host, options);
    tasks.push(routeTask);
    (0, set_defaults_1.setDefaults)(host, options);
    (0, create_ts_config_1.extractTsConfigBase)(host);
    if (!options.skipTsConfig && !options.isUsingTsSolutionConfig) {
        (0, js_1.addTsConfigPath)(host, options.importPath, [
            (0, maybe_js_1.maybeJs)(options, (0, devkit_1.joinPathFragments)(options.projectRoot, './src/index.ts')),
        ]);
    }
    (0, ts_solution_setup_1.updateTsconfigFiles)(host, options.projectRoot, 'tsconfig.lib.json', {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
    }, options.linter === 'eslint'
        ? ['eslint.config.js', 'eslint.config.cjs', 'eslint.config.mjs']
        : undefined);
    (0, sort_fields_1.sortPackageJsonFields)(host, options.projectRoot);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(host);
    }
    // Always run install to link packages.
    if (options.isUsingTsSolutionConfig) {
        tasks.push(() => (0, devkit_1.installPackagesTask)(host, true));
    }
    tasks.push(() => {
        (0, log_show_project_command_1.logShowProjectCommand)(options.name);
    });
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = libraryGenerator;
