"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.e2eProjectGenerator = e2eProjectGenerator;
exports.e2eProjectGeneratorInternal = e2eProjectGeneratorInternal;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
const eslint_1 = require("@nx/eslint");
const global_eslint_config_1 = require("@nx/eslint/src/generators/init/global-eslint-config");
const path = tslib_1.__importStar(require("path"));
const versions_1 = require("../../utils/versions");
const eslint_file_1 = require("@nx/eslint/src/generators/utils/eslint-file");
const log_show_project_command_1 = require("@nx/devkit/src/utils/log-show-project-command");
const config_file_1 = require("@nx/jest/src/utils/config/config-file");
const versions_2 = require("@nx/jest/src/utils/versions");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const posix_1 = require("node:path/posix");
const add_swc_config_1 = require("@nx/js/src/utils/swc/add-swc-config");
async function e2eProjectGenerator(host, options) {
    return await e2eProjectGeneratorInternal(host, {
        addPlugin: false,
        useProjectJson: true,
        ...options,
    });
}
async function e2eProjectGeneratorInternal(host, _options) {
    const tasks = [];
    const options = await normalizeOptions(host, _options);
    const appProject = (0, devkit_1.readProjectConfiguration)(host, options.project);
    // Detect Jest 30+ to use .cts config files (CommonJS TypeScript)
    const jestMajorVersion = (0, versions_2.getInstalledJestMajorVersion)(host);
    const useCommonJsConfig = jestMajorVersion === null || jestMajorVersion >= 30;
    const jestConfigExt = useCommonJsConfig ? 'cts' : 'ts';
    // TODO(@ndcunningham): This is broken.. the outputs are wrong.. and this isn't using the jest generator
    const packageJson = {
        name: options.importPath,
        version: '0.0.1',
        private: true,
    };
    if (!options.useProjectJson) {
        packageJson.nx = {
            name: options.e2eProjectName !== options.importPath
                ? options.e2eProjectName
                : undefined,
            implicitDependencies: [options.project],
            targets: {
                e2e: {
                    executor: '@nx/jest:jest',
                    outputs: ['{projectRoot}/test-output/jest/coverage'],
                    options: {
                        jestConfig: `${options.e2eProjectRoot}/jest.config.${jestConfigExt}`,
                        passWithNoTests: true,
                    },
                    dependsOn: [`${options.project}:build`, `${options.project}:serve`],
                },
            },
        };
    }
    else {
        (0, devkit_1.addProjectConfiguration)(host, options.e2eProjectName, {
            root: options.e2eProjectRoot,
            implicitDependencies: [options.project],
            projectType: 'application',
            targets: {
                e2e: {
                    executor: '@nx/jest:jest',
                    outputs: ['{workspaceRoot}/coverage/{e2eProjectRoot}'],
                    options: {
                        jestConfig: `${options.e2eProjectRoot}/jest.config.${jestConfigExt}`,
                        passWithNoTests: true,
                    },
                    dependsOn: [`${options.project}:build`, `${options.project}:serve`],
                },
            },
        });
    }
    if (!options.useProjectJson || options.isUsingTsSolutionConfig) {
        (0, devkit_1.writeJson)(host, (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'package.json'), packageJson);
    }
    // TODO(@nicholas): Find a better way to get build target
    // We remove the 'test' target from the e2e project because it is not needed
    // The 'e2e' target is the one that should run the tests for the e2e project
    const nxJson = (0, devkit_1.readNxJson)(host);
    const hasPlugin = nxJson.plugins?.some((p) => {
        if (typeof p !== 'string' && p.plugin === '@nx/jest/plugin') {
            return true;
        }
    });
    if (hasPlugin) {
        (0, devkit_1.updateJson)(host, 'nx.json', (json) => {
            return {
                ...json,
                plugins: json.plugins?.map((p) => {
                    if (typeof p !== 'string' && p.plugin === '@nx/jest/plugin') {
                        return {
                            ...p,
                            exclude: [...(p.exclude || []), `${options.e2eProjectRoot}/**/*`],
                        };
                    }
                    return p;
                }),
            };
        });
    }
    const jestPreset = (0, config_file_1.findRootJestPreset)(host) ?? 'jest.preset.js';
    const tsConfigFile = options.isUsingTsSolutionConfig
        ? 'tsconfig.json'
        : 'tsconfig.spec.json';
    const rootOffset = (0, devkit_1.offsetFromRoot)(options.e2eProjectRoot);
    const coverageDirectory = options.isUsingTsSolutionConfig
        ? 'test-output/jest/coverage'
        : (0, devkit_1.joinPathFragments)(rootOffset, 'coverage', options.e2eProjectName);
    const projectSimpleName = options.project.split('/').pop();
    if (options.projectType === 'server') {
        (0, devkit_1.generateFiles)(host, path.join(__dirname, 'files/server/common'), options.e2eProjectRoot, {
            ...options,
            ...(0, devkit_1.names)(options.rootProject ? 'server' : projectSimpleName),
            tsConfigFile,
            offsetFromRoot: rootOffset,
            jestPreset,
            coverageDirectory,
            tmpl: '',
        });
        if (options.isNest) {
            (0, devkit_1.generateFiles)(host, path.join(__dirname, 'files/server/nest'), options.e2eProjectRoot, {
                ...options,
                ...(0, devkit_1.names)(options.rootProject ? 'server' : projectSimpleName),
                tsConfigFile,
                offsetFromRoot: rootOffset,
                tmpl: '',
            });
        }
    }
    else if (options.projectType === 'cli') {
        const mainFile = appProject.targets.build?.options?.outputPath;
        (0, devkit_1.generateFiles)(host, path.join(__dirname, 'files/cli'), options.e2eProjectRoot, {
            ...options,
            ...(0, devkit_1.names)(options.rootProject ? 'cli' : projectSimpleName),
            mainFile,
            tsConfigFile,
            offsetFromRoot: rootOffset,
            jestPreset,
            coverageDirectory,
            tmpl: '',
        });
    }
    // Rename jest.config.ts to jest.config.cts for Jest 30+
    const jestConfigPath = (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'jest.config.ts');
    if (host.exists(jestConfigPath) && useCommonJsConfig) {
        host.rename(jestConfigPath, (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'jest.config.cts'));
    }
    if (options.isUsingTsSolutionConfig) {
        (0, add_swc_config_1.addSwcTestConfig)(host, options.e2eProjectRoot, 'es6');
        (0, devkit_1.generateFiles)(host, path.join(__dirname, 'files/ts-solution'), options.e2eProjectRoot, {
            ...options,
            relativeProjectReferencePath: (0, posix_1.relative)(options.e2eProjectRoot, appProject.root),
            offsetFromRoot: rootOffset,
            tmpl: '',
        });
    }
    else {
        (0, devkit_1.generateFiles)(host, path.join(__dirname, 'files/non-ts-solution'), options.e2eProjectRoot, {
            ...options,
            offsetFromRoot: rootOffset,
            tmpl: '',
        });
    }
    // axios is more than likely used in the application code, so install it as a regular dependency.
    const installTask = (0, devkit_1.addDependenciesToPackageJson)(host, { axios: versions_1.axiosVersion }, {});
    tasks.push(installTask);
    if (options.linter === 'eslint') {
        const linterTask = await (0, eslint_1.lintProjectGenerator)(host, {
            project: options.e2eProjectName,
            linter: 'eslint',
            skipFormat: true,
            tsConfigPaths: [
                (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'tsconfig.json'),
            ],
            setParserOptionsProject: false,
            skipPackageJson: false,
            rootProject: options.rootProject,
            addPlugin: options.addPlugin,
        });
        tasks.push(linterTask);
        if (options.rootProject && (0, eslint_file_1.isEslintConfigSupported)(host)) {
            (0, eslint_file_1.addPluginsToLintConfig)(host, options.e2eProjectRoot, '@nx');
            (0, eslint_file_1.replaceOverridesInLintConfig)(host, options.e2eProjectRoot, [
                global_eslint_config_1.typeScriptOverride,
                global_eslint_config_1.javaScriptOverride,
            ]);
        }
    }
    if (options.isUsingTsSolutionConfig) {
        (0, devkit_1.updateJson)(host, 'tsconfig.json', (json) => {
            json.references ??= [];
            const e2eRef = `./${options.e2eProjectRoot}`;
            if (!json.references.find((ref) => ref.path === e2eRef)) {
                json.references.push({ path: e2eRef });
            }
            return json;
        });
    }
    // If we are using the new TS solution
    // We need to update the workspace file (package.json or pnpm-workspaces.yaml) to include the new project
    if (options.isUsingTsSolutionConfig) {
        await (0, ts_solution_setup_1.addProjectToTsSolutionWorkspace)(host, options.e2eProjectRoot);
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(host);
    }
    tasks.push(() => {
        (0, log_show_project_command_1.logShowProjectCommand)(options.e2eProjectName);
    });
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
async function normalizeOptions(tree, options) {
    let directory = options.rootProject ? 'e2e' : options.directory;
    if (!directory) {
        const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
        directory = `${projectConfig.root}-e2e`;
    }
    const { projectName: e2eProjectName, projectRoot: e2eProjectRoot, importPath, } = await (0, project_name_and_root_utils_1.determineProjectNameAndRootOptions)(tree, {
        name: options.name,
        projectType: 'application',
        directory,
    });
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const addPlugin = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    const isUsingTsSolutionConfig = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree);
    return {
        addPlugin,
        ...options,
        e2eProjectRoot,
        e2eProjectName,
        importPath,
        port: options.port ?? 3000,
        rootProject: !!options.rootProject,
        isUsingTsSolutionConfig,
        useProjectJson: options.useProjectJson ?? !isUsingTsSolutionConfig,
    };
}
exports.default = e2eProjectGenerator;
