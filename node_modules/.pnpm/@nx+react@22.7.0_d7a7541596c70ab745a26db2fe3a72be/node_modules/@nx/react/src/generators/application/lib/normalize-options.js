"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
const assertion_1 = require("../../../utils/assertion");
const find_free_port_1 = require("./find-free-port");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
async function normalizeOptions(host, options) {
    await (0, project_name_and_root_utils_1.ensureRootProjectName)(options, 'application');
    const { projectName, names: projectNames, projectRoot: appProjectRoot, importPath, } = await (0, project_name_and_root_utils_1.determineProjectNameAndRootOptions)(host, {
        name: options.name,
        projectType: 'application',
        directory: options.directory,
        rootProject: options.rootProject,
    });
    const nxJson = (0, devkit_1.readNxJson)(host);
    const addPlugin = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    options.addPlugin ??= addPlugin;
    options.rootProject = appProjectRoot === '.';
    const isUsingTsSolutionConfig = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(host);
    const appProjectName = !isUsingTsSolutionConfig || options.name ? projectName : importPath;
    const e2eProjectName = options.rootProject ? 'e2e' : `${appProjectName}-e2e`;
    const e2eProjectRoot = options.rootProject ? 'e2e' : `${appProjectRoot}-e2e`;
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    const fileName = 'app';
    const styledModule = /^(css|scss|less|tailwind|none)$/.test(options.style)
        ? null
        : options.style;
    (0, assertion_1.assertValidStyle)(options.style);
    (0, assertion_1.assertValidReactRouter)(options.useReactRouter, options.bundler);
    if (options.useReactRouter && !options.bundler) {
        options.bundler = 'vite';
    }
    options.useReactRouter = options.routing ? options.useReactRouter : false;
    const normalized = {
        ...options,
        projectName: appProjectName,
        appProjectRoot,
        importPath,
        e2eProjectName,
        e2eProjectRoot,
        parsedTags,
        fileName,
        styledModule,
        hasStyles: options.style !== 'none',
        names: (0, devkit_1.names)(projectNames.projectSimpleName),
        isUsingTsSolutionConfig,
        useProjectJson: options.useProjectJson ?? !isUsingTsSolutionConfig,
    };
    normalized.routing = normalized.routing ?? false;
    normalized.useReactRouter = normalized.useReactRouter ?? false;
    normalized.strict = normalized.strict ?? true;
    normalized.classComponent = normalized.classComponent ?? false;
    normalized.compiler = normalized.compiler ?? 'babel';
    normalized.bundler = normalized.bundler ?? 'webpack';
    normalized.unitTestRunner = normalized.unitTestRunner ?? 'jest';
    normalized.e2eTestRunner = normalized.e2eTestRunner ?? 'playwright';
    normalized.inSourceTests = normalized.minimal || normalized.inSourceTests;
    normalized.devServerPort ??= options.port ?? (0, find_free_port_1.findFreePort)(host);
    normalized.minimal = normalized.minimal ?? false;
    return normalized;
}
