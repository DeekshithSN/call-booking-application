"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.libraryGenerator = libraryGenerator;
exports.libraryGeneratorInternal = libraryGeneratorInternal;
const devkit_1 = require("@nx/devkit");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
const js_1 = require("@nx/js");
const add_swc_config_1 = require("@nx/js/src/utils/swc/add-swc-config");
const add_swc_dependencies_1 = require("@nx/js/src/utils/swc/add-swc-dependencies");
const path_1 = require("path");
const versions_1 = require("../../utils/versions");
const init_1 = require("../init/init");
const target_defaults_utils_1 = require("@nx/devkit/src/generators/target-defaults-utils");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const sort_fields_1 = require("@nx/js/src/utils/package-json/sort-fields");
async function libraryGenerator(tree, schema) {
    return await libraryGeneratorInternal(tree, {
        addPlugin: false,
        useProjectJson: true,
        ...schema,
    });
}
async function libraryGeneratorInternal(tree, schema) {
    const options = await normalizeOptions(tree, schema);
    // If we are using the new TS solution
    // We need to update the workspace file (package.json or pnpm-workspaces.yaml) to include the new project
    if (options.isUsingTsSolutionConfig) {
        await (0, ts_solution_setup_1.addProjectToTsSolutionWorkspace)(tree, options.projectRoot);
    }
    const tasks = [];
    if (options.publishable === true && !schema.importPath) {
        throw new Error(`For publishable libs you have to provide a proper "--importPath" which needs to be a valid npm package name (e.g. my-awesome-lib or @myorg/my-lib)`);
    }
    // Create `package.json` first because @nx/js:lib generator will update it.
    if (!options.useProjectJson ||
        options.isUsingTsSolutionConfig ||
        options.publishable ||
        options.buildable) {
        (0, devkit_1.writeJson)(tree, (0, devkit_1.joinPathFragments)(options.projectRoot, 'package.json'), {
            name: options.importPath,
            version: '0.0.1',
            private: true,
        });
    }
    tasks.push(await (0, js_1.libraryGenerator)(tree, {
        ...schema,
        bundler: schema.buildable || schema.publishable ? schema.compiler : 'none',
        includeBabelRc: schema.babelJest,
        importPath: schema.importPath,
        testEnvironment: 'node',
        skipFormat: true,
        setParserOptionsProject: schema.setParserOptionsProject,
        useProjectJson: options.useProjectJson,
    }));
    updatePackageJson(tree, options);
    tasks.push(await (0, init_1.initGenerator)(tree, {
        ...options,
        skipFormat: true,
    }));
    createFiles(tree, options);
    if (options.js) {
        (0, devkit_1.updateTsConfigsToJs)(tree, options);
    }
    updateProject(tree, options);
    tasks.push(ensureDependencies(tree, options.compiler));
    // Always run install to link packages.
    if (options.isUsingTsSolutionConfig) {
        tasks.push(() => (0, devkit_1.installPackagesTask)(tree, true));
    }
    (0, sort_fields_1.sortPackageJsonFields)(tree, options.projectRoot);
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = libraryGenerator;
async function normalizeOptions(tree, options) {
    await (0, project_name_and_root_utils_1.ensureRootProjectName)(options, 'library');
    const { projectName, names: projectNames, projectRoot, importPath, } = await (0, project_name_and_root_utils_1.determineProjectNameAndRootOptions)(tree, {
        name: options.name,
        projectType: 'library',
        directory: options.directory,
        importPath: options.importPath,
    });
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const addPluginDefault = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    options.addPlugin ??= addPluginDefault;
    const fileName = (0, devkit_1.names)(options.simpleModuleName
        ? projectNames.projectSimpleName
        : projectNames.projectFileName).fileName;
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    // this helper is called before the jsLibraryGenerator is called, so, if the
    // TS solution setup is not configured, we additionally check if the TS
    // solution setup will be configured by the jsLibraryGenerator
    const isUsingTsSolutionConfig = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree) ||
        (0, ts_solution_setup_1.shouldConfigureTsSolutionSetup)(tree, options.addPlugin);
    return {
        ...options,
        fileName,
        projectName: isUsingTsSolutionConfig && !options.name ? importPath : projectName,
        projectRoot,
        parsedTags,
        importPath,
        isUsingTsSolutionConfig,
        useProjectJson: options.useProjectJson ?? !isUsingTsSolutionConfig,
    };
}
function createFiles(tree, options) {
    const { className, name, propertyName } = (0, devkit_1.names)(options.fileName);
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, './files/lib'), options.projectRoot, {
        ...options,
        className,
        name,
        propertyName,
        tmpl: '',
        offsetFromRoot: (0, devkit_1.offsetFromRoot)(options.projectRoot),
    });
    if (options.unitTestRunner === 'none') {
        tree.delete((0, path_1.join)(options.projectRoot, `./src/lib/${options.fileName}.spec.ts`));
    }
    if (options.js) {
        (0, devkit_1.toJS)(tree);
    }
}
function updateProject(tree, options) {
    if (!options.publishable && !options.buildable) {
        return;
    }
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.projectName);
    const rootProject = options.projectRoot === '.' || options.projectRoot === '';
    project.targets = project.targets || {};
    (0, target_defaults_utils_1.addBuildTargetDefaults)(tree, `@nx/js:${options.compiler}`);
    // For TS solution, we want tsc build to be inferred by `@nx/js/typescript` plugin.
    if (!options.isUsingTsSolutionConfig || options.compiler === 'swc') {
        project.targets.build = {
            executor: `@nx/js:${options.compiler}`,
            outputs: ['{options.outputPath}'],
            options: {
                outputPath: options.isUsingTsSolutionConfig
                    ? (0, devkit_1.joinPathFragments)(options.projectRoot, 'dist')
                    : (0, devkit_1.joinPathFragments)('dist', rootProject ? options.projectName : options.projectRoot),
                tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
                packageJson: `${options.projectRoot}/package.json`,
                main: `${options.projectRoot}/src/index` + (options.js ? '.js' : '.ts'),
                assets: options.isUsingTsSolutionConfig
                    ? undefined
                    : [`${options.projectRoot}/*.md`],
                stripLeadingPaths: options.isUsingTsSolutionConfig ? true : undefined,
            },
        };
    }
    if (options.compiler === 'swc') {
        (0, add_swc_dependencies_1.addSwcDependencies)(tree);
        (0, add_swc_config_1.addSwcConfig)(tree, options.projectRoot);
    }
    if (options.rootDir) {
        project.targets.build.options.srcRootForCompilationRoot = options.rootDir;
    }
    (0, devkit_1.updateProjectConfiguration)(tree, options.projectName, project);
}
function ensureDependencies(tree, compiler) {
    // Only add tslib when using tsc compiler
    // When using swc, @swc/helpers is added by addSwcDependencies()
    const dependencies = compiler === 'tsc' ? { tslib: versions_1.tslibVersion } : {};
    return (0, devkit_1.addDependenciesToPackageJson)(tree, dependencies, {
        '@types/node': versions_1.typesNodeVersion,
    });
}
function updatePackageJson(tree, options) {
    const packageJsonPath = (0, devkit_1.joinPathFragments)(options.projectRoot, 'package.json');
    if (!tree.exists(packageJsonPath)) {
        return;
    }
    const packageJson = (0, devkit_1.readJson)(tree, packageJsonPath);
    if (packageJson.type === 'module') {
        // The @nx/js:lib generator can set the type to 'module' which would
        // potentially break consumers of the library.
        delete packageJson.type;
    }
    (0, devkit_1.writeJson)(tree, packageJsonPath, packageJson);
}
