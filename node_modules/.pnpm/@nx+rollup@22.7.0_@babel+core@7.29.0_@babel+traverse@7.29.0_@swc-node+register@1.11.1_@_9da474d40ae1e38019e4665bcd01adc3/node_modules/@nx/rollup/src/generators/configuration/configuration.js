"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurationGenerator = configurationGenerator;
const devkit_1 = require("@nx/devkit");
const target_defaults_utils_1 = require("@nx/devkit/src/generators/target-defaults-utils");
const js_1 = require("@nx/js");
const get_import_path_1 = require("@nx/js/src/utils/get-import-path");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const posix_1 = require("node:path/posix");
const devkit_internals_1 = require("nx/src/devkit-internals");
const ensure_dependencies_1 = require("../../utils/ensure-dependencies");
const has_plugin_1 = require("../../utils/has-plugin");
const init_1 = require("../init/init");
let ts;
async function configurationGenerator(tree, options) {
    const tasks = [];
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const addPluginDefault = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    options.addPlugin ??= addPluginDefault;
    tasks.push(await (0, init_1.rollupInitGenerator)(tree, { ...options, skipFormat: true }));
    if (!options.skipPackageJson) {
        tasks.push((0, ensure_dependencies_1.ensureDependencies)(tree, options));
    }
    const isTsSolutionSetup = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree);
    let outputConfig;
    if ((0, has_plugin_1.hasPlugin)(tree)) {
        outputConfig = createRollupConfig(tree, options, isTsSolutionSetup);
    }
    else {
        options.buildTarget ??= 'build';
        checkForTargetConflicts(tree, options);
        addBuildTarget(tree, options, isTsSolutionSetup);
    }
    updatePackageJson(tree, options, outputConfig, isTsSolutionSetup);
    if (isTsSolutionSetup) {
        updateTsConfig(tree, options);
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
function createRollupConfig(tree, options, isTsSolutionSetup) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const main = options.main
        ? `./${(0, posix_1.relative)(project.root, options.main)}`
        : './src/index.ts';
    const outputPath = isTsSolutionSetup
        ? './dist'
        : (0, devkit_1.joinPathFragments)((0, devkit_1.offsetFromRoot)(project.root), 'dist', project.root === '.' ? project.name : project.root);
    const buildOptions = {
        outputPath,
        compiler: options.compiler ?? 'babel',
        main,
        tsConfig: options.tsConfig
            ? `./${(0, posix_1.relative)(project.root, options.tsConfig)}`
            : './tsconfig.lib.json',
    };
    tree.write((0, devkit_1.joinPathFragments)(project.root, 'rollup.config.cjs'), `const { withNx } = require('@nx/rollup/with-nx');

module.exports = withNx(
  {
    main: '${buildOptions.main}',
    outputPath: '${buildOptions.outputPath}',
    tsConfig: '${buildOptions.tsConfig}',
    compiler: '${buildOptions.compiler}',
    format: ${JSON.stringify(options.format ?? ['esm'])},${!isTsSolutionSetup
        ? `
    assets: [{ input: '{projectRoot}', output: '.', glob:'*.md' }],`
        : ''}
  },
  {
    // Provide additional rollup configuration here. See: https://rollupjs.org/configuration-options
    // e.g.
    // output: { sourcemap: true },
  }
);
`);
    return {
        main: (0, devkit_1.joinPathFragments)(project.root, main),
        outputPath: (0, devkit_1.joinPathFragments)(project.root, outputPath),
    };
}
function checkForTargetConflicts(tree, options) {
    if (options.skipValidation)
        return;
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    if (project.targets?.[options.buildTarget]) {
        throw new Error(`Project "${options.project}" already has a ${options.buildTarget} target. Pass --skipValidation to ignore this error.`);
    }
}
function updatePackageJson(tree, options, outputConfig, isTsSolutionSetup) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const packageJsonPath = (0, posix_1.join)(project.root, 'package.json');
    let packageJson;
    if (tree.exists(packageJsonPath)) {
        if (!isTsSolutionSetup) {
            return;
        }
        packageJson = (0, devkit_1.readJson)(tree, packageJsonPath);
    }
    else {
        packageJson = {
            name: options.importPath || (0, get_import_path_1.getImportPath)(tree, options.project),
            version: '0.0.1',
        };
    }
    if (isTsSolutionSetup) {
        let main;
        let outputPath;
        if (outputConfig) {
            ({ main, outputPath } = outputConfig);
        }
        else {
            // target must exist if we don't receive an outputConfig
            const projectTarget = project.targets[options.buildTarget];
            const nxJson = (0, devkit_1.readNxJson)(tree);
            const mergedTarget = (0, devkit_internals_1.mergeTargetConfigurations)(projectTarget, (projectTarget.executor
                ? nxJson.targetDefaults?.[projectTarget.executor]
                : undefined) ?? nxJson.targetDefaults?.[options.buildTarget]);
            ({ main, outputPath } = mergedTarget.options);
        }
        packageJson = (0, js_1.getUpdatedPackageJsonContent)(packageJson, {
            main,
            outputPath,
            projectRoot: project.root,
            rootDir: (0, posix_1.dirname)(main),
            generateExportsField: true,
            packageJsonPath,
            format: options.format ?? ['esm'],
            outputFileExtensionForCjs: '.cjs.js',
            outputFileExtensionForEsm: '.esm.js',
            developmentConditionName: (0, ts_solution_setup_1.getDefinedCustomConditionName)(tree),
        });
        // rollup has a specific declaration file generation not handled by the util above,
        // adjust accordingly
        const typingsFile = (packageJson.module ?? packageJson.main).replace(/\.js$/, '.d.ts');
        packageJson.types = typingsFile;
        packageJson.exports['.'].types = typingsFile;
    }
    (0, devkit_1.writeJson)(tree, packageJsonPath, packageJson);
}
function addBuildTarget(tree, options, isTsSolutionSetup) {
    (0, target_defaults_utils_1.addBuildTargetDefaults)(tree, '@nx/rollup:rollup', options.buildTarget);
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const prevBuildOptions = project.targets?.[options.buildTarget]?.options;
    options.tsConfig ??=
        prevBuildOptions?.tsConfig ??
            (0, devkit_1.joinPathFragments)(project.root, 'tsconfig.lib.json');
    let outputPath = prevBuildOptions?.outputPath;
    if (!outputPath) {
        outputPath = isTsSolutionSetup
            ? (0, devkit_1.joinPathFragments)(project.root, 'dist')
            : (0, devkit_1.joinPathFragments)('dist', project.root === '.' ? project.name : project.root);
    }
    const buildOptions = {
        main: options.main ??
            prevBuildOptions?.main ??
            (0, devkit_1.joinPathFragments)(project.root, 'src/index.ts'),
        outputPath,
        tsConfig: options.tsConfig,
        // TODO(leo): see if we can use this when updating the package.json for the new setup
        // additionalEntryPoints: prevBuildOptions?.additionalEntryPoints,
        // generateExportsField: prevBuildOptions?.generateExportsField,
        compiler: options.compiler ?? 'babel',
        project: `${project.root}/package.json`,
        external: options.external,
        format: (options.format ?? isTsSolutionSetup) ? ['esm'] : undefined,
    };
    if (options.rollupConfig) {
        buildOptions.rollupConfig = options.rollupConfig;
    }
    if (!isTsSolutionSetup) {
        buildOptions.additionalEntryPoints =
            prevBuildOptions?.additionalEntryPoints;
        buildOptions.generateExportsField = prevBuildOptions?.generateExportsField;
        if (tree.exists((0, devkit_1.joinPathFragments)(project.root, 'README.md'))) {
            buildOptions.assets = [
                {
                    glob: `${project.root}/README.md`,
                    input: '.',
                    output: '.',
                },
            ];
        }
    }
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, {
        ...project,
        targets: {
            ...project.targets,
            [options.buildTarget]: {
                executor: '@nx/rollup:rollup',
                outputs: ['{options.outputPath}'],
                options: buildOptions,
            },
        },
    });
}
function updateTsConfig(tree, options) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const tsconfigPath = options.tsConfig ?? (0, devkit_1.joinPathFragments)(project.root, 'tsconfig.lib.json');
    if (!tree.exists(tsconfigPath)) {
        throw new Error(`The '${tsconfigPath}' file doesn't exist. Provide the 'tsConfig' option with the correct path pointing to the tsconfig file to use for builds.`);
    }
    if (!ts) {
        ts = (0, ensure_typescript_1.ensureTypescript)();
    }
    const parsedTsConfig = (0, js_1.readTsConfig)(tsconfigPath, {
        ...ts.sys,
        readFile: (p) => tree.read(p, 'utf-8'),
        fileExists: (p) => tree.exists(p),
    });
    (0, devkit_1.updateJson)(tree, tsconfigPath, (json) => {
        if (parsedTsConfig.options.module === ts.ModuleKind.NodeNext) {
            json.compilerOptions ??= {};
            json.compilerOptions.module = 'esnext';
            json.compilerOptions.moduleResolution = 'bundler';
        }
        return json;
    });
}
exports.default = configurationGenerator;
