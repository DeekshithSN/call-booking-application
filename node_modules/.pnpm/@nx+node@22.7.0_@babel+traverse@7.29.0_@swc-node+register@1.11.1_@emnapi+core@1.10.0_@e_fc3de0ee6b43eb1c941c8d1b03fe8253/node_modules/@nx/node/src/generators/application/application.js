"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationGenerator = applicationGenerator;
exports.applicationGeneratorInternal = applicationGeneratorInternal;
const devkit_1 = require("@nx/devkit");
const jest_1 = require("@nx/jest");
const js_1 = require("@nx/js");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const sort_fields_1 = require("@nx/js/src/utils/package-json/sort-fields");
const log_show_project_command_1 = require("@nx/devkit/src/utils/log-show-project-command");
const versions_1 = require("../../utils/versions");
const e2e_project_1 = require("../e2e-project/e2e-project");
const init_1 = require("../init/init");
const setup_docker_1 = require("../setup-docker/setup-docker");
const lib_1 = require("./lib");
function updateTsConfigOptions(tree, options) {
    if (options.isUsingTsSolutionConfig) {
        return;
    }
    (0, devkit_1.updateJson)(tree, `${options.appProjectRoot}/tsconfig.json`, (json) => {
        if (options.rootProject) {
            return {
                compilerOptions: {
                    ...js_1.tsConfigBaseOptions,
                    ...json.compilerOptions,
                    esModuleInterop: true,
                },
                ...json,
                extends: undefined,
                exclude: ['node_modules', 'tmp'],
            };
        }
        else {
            return {
                ...json,
                compilerOptions: {
                    ...json.compilerOptions,
                    esModuleInterop: true,
                },
            };
        }
    });
}
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
    });
    tasks.push(jsInitTask);
    const options = await (0, lib_1.normalizeOptions)(tree, schema);
    if (options.framework === 'nest') {
        // nx-ignore-next-line
        const { applicationGenerator } = (0, devkit_1.ensurePackage)('@nx/nest', versions_1.nxVersion);
        const nestTasks = await applicationGenerator(tree, {
            ...options,
            skipFormat: true,
        });
        tasks.push(nestTasks);
        if (options.docker) {
            const dockerTask = await (0, setup_docker_1.setupDockerGenerator)(tree, {
                ...options,
                project: options.name,
                skipFormat: true,
            });
            tasks.push(dockerTask);
        }
        return (0, devkit_1.runTasksInSerial)(...[
            ...tasks,
            () => {
                (0, log_show_project_command_1.logShowProjectCommand)(options.name);
            },
        ]);
    }
    const initTask = await (0, init_1.initGenerator)(tree, {
        ...schema,
        skipFormat: true,
    });
    tasks.push(initTask);
    const { installTask, frameworkDependencies } = (0, lib_1.addProjectDependencies)(tree, options);
    tasks.push(installTask);
    if (options.bundler === 'webpack') {
        const { webpackInitGenerator } = (0, devkit_1.ensurePackage)('@nx/webpack', versions_1.nxVersion);
        const webpackInitTask = await webpackInitGenerator(tree, {
            skipPackageJson: options.skipPackageJson,
            skipFormat: true,
            addPlugin: options.addPlugin,
        });
        tasks.push(webpackInitTask);
        if (!options.skipPackageJson) {
            const { ensureDependencies } = await Promise.resolve().then(() => __importStar(require('@nx/webpack/src/utils/ensure-dependencies')));
            tasks.push(ensureDependencies(tree, {
                uiFramework: options.isNest ? 'none' : 'react',
            }));
        }
    }
    (0, lib_1.addAppFiles)(tree, options);
    (0, lib_1.addProject)(tree, options, frameworkDependencies);
    // If we are using the new TS solution
    // We need to update the workspace file (package.json or pnpm-workspaces.yaml) to include the new project
    if (options.isUsingTsSolutionConfig) {
        await (0, ts_solution_setup_1.addProjectToTsSolutionWorkspace)(tree, options.appProjectRoot);
    }
    updateTsConfigOptions(tree, options);
    if (options.linter === 'eslint') {
        const lintTask = await (0, lib_1.addLintingToApplication)(tree, options);
        tasks.push(lintTask);
    }
    if (options.unitTestRunner === 'jest') {
        const jestTask = await (0, jest_1.configurationGenerator)(tree, {
            ...options,
            project: options.name,
            setupFile: 'none',
            skipSerializers: true,
            supportTsx: options.js,
            testEnvironment: 'node',
            compiler: options.swcJest ? 'swc' : 'tsc',
            skipFormat: true,
        });
        tasks.push(jestTask);
        // There are no tests by default, so set `--passWithNoTests` to avoid test failure on new project.
        const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.name);
        projectConfig.targets ??= {};
        projectConfig.targets.test = {
            ...projectConfig.targets.test,
            options: {
                ...projectConfig.targets.test?.options,
                passWithNoTests: true,
            },
        };
        (0, devkit_1.updateProjectConfiguration)(tree, options.name, projectConfig);
    }
    else {
        // No need for default spec file if unit testing is not setup.
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/app/app.spec.ts'));
    }
    if (options.e2eTestRunner === 'jest') {
        const e2eTask = await (0, e2e_project_1.e2eProjectGenerator)(tree, {
            ...options,
            projectType: options.framework === 'none' ? 'cli' : 'server',
            name: options.rootProject ? 'e2e' : `${options.name}-e2e`,
            directory: options.rootProject ? 'e2e' : `${options.appProjectRoot}-e2e`,
            project: options.name,
            port: options.port,
            isNest: options.isNest,
            skipFormat: true,
        });
        tasks.push(e2eTask);
    }
    if (options.js) {
        (0, devkit_1.updateTsConfigsToJs)(tree, { projectRoot: options.appProjectRoot });
    }
    if (options.frontendProject) {
        (0, lib_1.addProxy)(tree, options);
    }
    if (options.docker) {
        const dockerTask = await (0, setup_docker_1.setupDockerGenerator)(tree, {
            ...options,
            project: options.name,
            skipFormat: true,
            skipDockerPlugin: options.skipDockerPlugin ?? false,
        });
        tasks.push(dockerTask);
    }
    if (options.isUsingTsSolutionConfig) {
        (0, ts_solution_setup_1.updateTsconfigFiles)(tree, options.appProjectRoot, 'tsconfig.app.json', {
            module: 'nodenext',
            moduleResolution: 'nodenext',
        }, options.linter === 'eslint'
            ? ['eslint.config.js', 'eslint.config.cjs', 'eslint.config.mjs']
            : undefined);
    }
    (0, sort_fields_1.sortPackageJsonFields)(tree, options.appProjectRoot);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    tasks.push(() => {
        (0, log_show_project_command_1.logShowProjectCommand)(options.name);
    });
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = applicationGenerator;
