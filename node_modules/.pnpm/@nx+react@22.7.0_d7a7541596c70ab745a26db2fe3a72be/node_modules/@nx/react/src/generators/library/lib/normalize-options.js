"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
const assertion_1 = require("../../../utils/assertion");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
async function normalizeOptions(host, options) {
    const isUsingTsSolutionConfig = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(host);
    await (0, project_name_and_root_utils_1.ensureRootProjectName)(options, 'library');
    const { projectName, names: projectNames, projectRoot, importPath, } = await (0, project_name_and_root_utils_1.determineProjectNameAndRootOptions)(host, {
        name: options.name,
        projectType: 'library',
        directory: options.directory,
        importPath: options.importPath,
    });
    const nxJson = (0, devkit_1.readNxJson)(host);
    const addPlugin = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    options.addPlugin ??= addPlugin;
    const fileName = projectNames.projectFileName;
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    let bundler = options.bundler ?? 'none';
    if (bundler === 'none') {
        if (options.publishable) {
            devkit_1.logger.warn(`Publishable libraries cannot be used with bundler: 'none'. Defaulting to 'rollup'.`);
            bundler = 'rollup';
        }
        if (options.buildable) {
            devkit_1.logger.warn(`Buildable libraries cannot be used with bundler: 'none'. Defaulting to 'rollup'.`);
            bundler = 'rollup';
        }
    }
    const normalized = {
        ...options,
        compiler: options.compiler ?? 'babel',
        bundler,
        fileName,
        routePath: `/${projectNames.projectSimpleName}`,
        name: isUsingTsSolutionConfig && !options.name ? importPath : projectName,
        projectRoot,
        parsedTags,
        importPath,
        useProjectJson: options.useProjectJson ?? !isUsingTsSolutionConfig,
    };
    // Libraries with a bundler or is publishable must also be buildable.
    normalized.buildable = Boolean(normalized.bundler !== 'none' || options.buildable || options.publishable);
    normalized.inSourceTests === normalized.minimal || normalized.inSourceTests;
    if (options.appProject) {
        const appProjectConfig = (0, devkit_1.getProjects)(host).get(options.appProject);
        const appProjectType = (0, ts_solution_setup_1.getProjectType)(host, appProjectConfig.root, appProjectConfig.projectType);
        if (appProjectType !== 'application') {
            throw new Error(`appProject expected type of "application" but got "${appProjectType}"`);
        }
        const appSourceRoot = (0, ts_solution_setup_1.getProjectSourceRoot)(appProjectConfig, host);
        normalized.appMain =
            appProjectConfig.targets.build?.options?.main ??
                findMainEntry(host, appProjectConfig.root);
        normalized.appSourceRoot = (0, devkit_1.normalizePath)(appSourceRoot);
        // TODO(jack): We should use appEntryFile instead of appProject so users can directly set it rather than us inferring it.
        if (!normalized.appMain) {
            throw new Error(`Could not locate project main for ${options.appProject}`);
        }
    }
    (0, assertion_1.assertValidStyle)(normalized.style);
    normalized.isUsingTsSolutionConfig = isUsingTsSolutionConfig;
    return normalized;
}
function findMainEntry(tree, projectRoot) {
    const mainFiles = [
        // These are the main files we generate with.
        'src/main.ts',
        'src/main.tsx',
        'src/main.js',
        'src/main.jsx',
        // Other options just in case
        'src/index.ts',
        'src/index.tsx',
        'src/index.js',
        'src/index.jsx',
        'main.ts',
        'main.tsx',
        'main.js',
        'main.jsx',
        'index.ts',
        'index.tsx',
        'index.js',
        'index.jsx',
    ];
    const mainEntry = mainFiles.find((file) => tree.exists((0, devkit_1.joinPathFragments)(projectRoot, file)));
    return mainEntry ? (0, devkit_1.joinPathFragments)(projectRoot, mainEntry) : undefined;
}
