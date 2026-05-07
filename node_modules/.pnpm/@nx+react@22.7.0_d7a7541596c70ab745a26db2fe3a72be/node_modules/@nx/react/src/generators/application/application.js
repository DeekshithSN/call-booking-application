"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationGenerator = applicationGenerator;
exports.applicationGeneratorInternal = applicationGeneratorInternal;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const log_show_project_command_1 = require("@nx/devkit/src/utils/log-show-project-command");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const create_ts_config_1 = require("../../utils/create-ts-config");
const add_styled_dependencies_1 = require("../../rules/add-styled-dependencies");
const setup_tailwind_1 = require("../setup-tailwind/setup-tailwind");
const init_1 = tslib_1.__importDefault(require("../init/init"));
const create_application_files_1 = require("./lib/create-application-files");
const update_jest_config_1 = require("./lib/update-jest-config");
const normalize_options_1 = require("./lib/normalize-options");
const add_project_1 = require("./lib/add-project");
const add_jest_1 = require("./lib/add-jest");
const add_routing_1 = require("./lib/add-routing");
const set_defaults_1 = require("./lib/set-defaults");
const add_linting_1 = require("./lib/add-linting");
const add_e2e_1 = require("./lib/add-e2e");
const show_possible_warnings_1 = require("./lib/show-possible-warnings");
const install_common_dependencies_1 = require("./lib/install-common-dependencies");
const add_webpack_1 = require("./lib/bundlers/add-webpack");
const add_rspack_1 = require("./lib/bundlers/add-rspack");
const add_rsbuild_1 = require("./lib/bundlers/add-rsbuild");
const add_vite_1 = require("./lib/bundlers/add-vite");
const sort_fields_1 = require("@nx/js/src/utils/package-json/sort-fields");
const prompt_1 = require("@nx/devkit/src/generators/prompt");
async function applicationGenerator(tree, schema) {
    return await applicationGeneratorInternal(tree, {
        addPlugin: false,
        useProjectJson: true,
        ...schema,
    });
}
async function applicationGeneratorInternal(tree, schema) {
    const tasks = [];
    const addTsPlugin = (0, ts_solution_setup_1.shouldConfigureTsSolutionSetup)(tree, schema.addPlugin, schema.useTsSolution);
    const jsInitTask = await (0, js_1.initGenerator)(tree, {
        ...schema,
        tsConfigName: schema.rootProject ? 'tsconfig.json' : 'tsconfig.base.json',
        skipFormat: true,
        addTsPlugin,
        formatter: schema.formatter,
        platform: 'web',
    });
    tasks.push(jsInitTask);
    const options = await (0, normalize_options_1.normalizeOptions)(tree, schema);
    options.useReactRouter =
        options.routing && options.bundler === 'vite'
            ? (options.useReactRouter ??
                (await (0, prompt_1.promptWhenInteractive)({
                    name: 'response',
                    message: 'Would you like to use react-router for server-side rendering?',
                    type: 'autocomplete',
                    choices: [
                        {
                            name: 'Yes',
                            message: 'I want to use react-router   [ https://reactrouter.com/start/framework/routing   ]',
                        },
                        {
                            name: 'No',
                            message: 'I do not want to use react-router for server-side rendering',
                        },
                    ],
                    initial: 0,
                }, { response: 'No' }).then((r) => r.response === 'Yes')))
            : false;
    (0, show_possible_warnings_1.showPossibleWarnings)(tree, options);
    const initTask = await (0, init_1.default)(tree, {
        ...options,
        skipFormat: true,
        useReactRouterPlugin: options.useReactRouter,
    });
    tasks.push(initTask);
    if (!options.addPlugin) {
        const nxJson = (0, devkit_1.readNxJson)(tree);
        nxJson.targetDefaults ??= {};
        if (!Object.keys(nxJson.targetDefaults).includes('build')) {
            nxJson.targetDefaults.build = {
                cache: true,
                dependsOn: ['^build'],
            };
        }
        else if (!nxJson.targetDefaults.build.dependsOn) {
            nxJson.targetDefaults.build.dependsOn = ['^build'];
        }
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
    if (options.bundler === 'webpack') {
        await (0, add_webpack_1.initWebpack)(tree, options, tasks);
    }
    else if (options.bundler === 'rspack') {
        await (0, add_rspack_1.initRspack)(tree, options, tasks);
    }
    else if (options.bundler === 'rsbuild') {
        await (0, add_rsbuild_1.initRsbuild)(tree, options, tasks);
    }
    if (!options.rootProject) {
        (0, create_ts_config_1.extractTsConfigBase)(tree);
    }
    await (0, create_application_files_1.createApplicationFiles)(tree, options);
    (0, add_project_1.addProject)(tree, options);
    // If we are using the new TS solution
    // We need to update the workspace file (package.json or pnpm-workspaces.yaml) to include the new project
    if (options.isUsingTsSolutionConfig) {
        await (0, ts_solution_setup_1.addProjectToTsSolutionWorkspace)(tree, options.appProjectRoot);
    }
    if (options.style === 'tailwind') {
        const twTask = await (0, setup_tailwind_1.setupTailwindGenerator)(tree, {
            project: options.projectName,
        });
        tasks.push(twTask);
    }
    const lintTask = await (0, add_linting_1.addLinting)(tree, options);
    tasks.push(lintTask);
    if (options.bundler === 'vite') {
        await (0, add_vite_1.setupViteConfiguration)(tree, options, tasks);
    }
    else if (options.bundler === 'rsbuild') {
        await (0, add_rsbuild_1.setupRsbuildConfiguration)(tree, options, tasks);
    }
    if (options.bundler !== 'vite' && options.unitTestRunner === 'vitest') {
        await (0, add_vite_1.setupVitestConfiguration)(tree, options, tasks);
    }
    if ((options.bundler === 'vite' || options.unitTestRunner === 'vitest') &&
        options.inSourceTests) {
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, `src/app/${options.fileName}.spec.tsx`));
    }
    const e2eTask = await (0, add_e2e_1.addE2e)(tree, options);
    tasks.push(e2eTask);
    if (options.unitTestRunner === 'jest') {
        const jestTask = await (0, add_jest_1.addJest)(tree, options);
        tasks.push(jestTask);
    }
    // Handle tsconfig.spec.json for jest or vitest
    (0, update_jest_config_1.updateSpecConfig)(tree, options);
    const commonDependencyTask = await (0, install_common_dependencies_1.installCommonDependencies)(tree, options);
    tasks.push(commonDependencyTask);
    const styledTask = (0, add_styled_dependencies_1.addStyledModuleDependencies)(tree, options);
    tasks.push(styledTask);
    if (!options.useReactRouter) {
        const routingTask = (0, add_routing_1.addRouting)(tree, options);
        tasks.push(routingTask);
    }
    (0, set_defaults_1.setDefaults)(tree, options);
    if (options.bundler === 'rspack' && options.style === 'styled-jsx') {
        (0, add_rspack_1.handleStyledJsxForRspack)(tasks, tree, options);
    }
    if (options.useReactRouter) {
        (0, devkit_1.updateJson)(tree, (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.json'), (json) => {
            const types = new Set(json.compilerOptions?.types || []);
            types.add('@react-router/node');
            types.add('node');
            return {
                ...json,
                compilerOptions: {
                    ...json.compilerOptions,
                    jsx: 'react-jsx',
                    moduleResolution: 'bundler',
                    types: Array.from(types),
                },
            };
        });
    }
    // Only for the new TS solution
    (0, ts_solution_setup_1.updateTsconfigFiles)(tree, options.appProjectRoot, 'tsconfig.app.json', {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
    }, options.linter === 'eslint'
        ? ['eslint.config.js', 'eslint.config.cjs', 'eslint.config.mjs']
        : undefined, options.useReactRouter ? 'app' : 'src');
    (0, sort_fields_1.sortPackageJsonFields)(tree, options.appProjectRoot);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    tasks.push(() => {
        (0, log_show_project_command_1.logShowProjectCommand)(options.projectName);
    });
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = applicationGenerator;
