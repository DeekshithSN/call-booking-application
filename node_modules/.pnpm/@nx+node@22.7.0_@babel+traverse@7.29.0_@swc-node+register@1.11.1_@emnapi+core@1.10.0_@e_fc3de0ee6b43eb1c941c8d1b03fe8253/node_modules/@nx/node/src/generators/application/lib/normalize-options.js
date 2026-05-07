"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
async function normalizeOptions(host, options) {
    await (0, project_name_and_root_utils_1.ensureRootProjectName)(options, 'application');
    const { projectName, projectRoot: appProjectRoot, importPath, } = await (0, project_name_and_root_utils_1.determineProjectNameAndRootOptions)(host, {
        name: options.name,
        projectType: 'application',
        directory: options.directory,
        rootProject: options.rootProject,
    });
    options.rootProject = appProjectRoot === '.';
    options.bundler = options.bundler ?? 'esbuild';
    options.e2eTestRunner = options.e2eTestRunner ?? 'jest';
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    const nxJson = (0, devkit_1.readNxJson)(host);
    const addPlugin = options.addPlugin ??
        (process.env.NX_ADD_PLUGINS !== 'false' &&
            nxJson.useInferencePlugins !== false);
    const isUsingTsSolutionConfig = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(host);
    const swcJest = options.swcJest ?? isUsingTsSolutionConfig;
    const appProjectName = !isUsingTsSolutionConfig || options.name ? projectName : importPath;
    const useProjectJson = options.useProjectJson ?? !isUsingTsSolutionConfig;
    return {
        ...options,
        addPlugin,
        name: appProjectName,
        frontendProject: options.frontendProject
            ? (0, devkit_1.names)(options.frontendProject).fileName
            : undefined,
        appProjectRoot,
        importPath,
        parsedTags,
        linter: options.linter ?? 'eslint',
        unitTestRunner: options.unitTestRunner ?? 'jest',
        rootProject: options.rootProject ?? false,
        port: options.port ?? 3000,
        outputPath: isUsingTsSolutionConfig
            ? (0, devkit_1.joinPathFragments)(appProjectRoot, 'dist')
            : (0, devkit_1.joinPathFragments)('dist', options.rootProject ? appProjectName : appProjectRoot),
        isUsingTsSolutionConfig,
        swcJest,
        useProjectJson,
    };
}
