"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineModuleFormatFromTsConfig = determineModuleFormatFromTsConfig;
exports.createTypeScriptCompilationOptions = createTypeScriptCompilationOptions;
exports.tscExecutor = tscExecutor;
const tslib_1 = require("tslib");
const ts = tslib_1.__importStar(require("typescript"));
const devkit_1 = require("@nx/devkit");
const fs_1 = require("fs");
const path_1 = require("path");
const copy_assets_handler_1 = require("../../utils/assets/copy-assets-handler");
const check_dependencies_1 = require("../../utils/check-dependencies");
const compiler_helper_dependency_1 = require("../../utils/compiler-helper-dependency");
const update_package_json_1 = require("../../utils/package-json/update-package-json");
const compile_typescript_files_1 = require("../../utils/typescript/compile-typescript-files");
const watch_for_single_file_changes_1 = require("../../utils/watch-for-single-file-changes");
const lib_1 = require("./lib");
const ts_config_1 = require("../../utils/typescript/ts-config");
const create_entry_points_1 = require("../../utils/package-json/create-entry-points");
function determineModuleFormatFromTsConfig(absolutePathToTsConfig, projectRoot, workspaceRoot) {
    const tsConfig = (0, ts_config_1.readTsConfig)(absolutePathToTsConfig);
    // NodeNext is context-dependent - check package.json type field
    // NodeNext outputs ESM only when package.json has "type": "module"
    // Otherwise it outputs CJS (when "type": "commonjs" or no type field)
    if (tsConfig.options.module === ts.ModuleKind.NodeNext) {
        if (projectRoot && workspaceRoot) {
            const packageJsonPath = (0, path_1.join)(workspaceRoot, projectRoot, 'package.json');
            if ((0, fs_1.existsSync)(packageJsonPath)) {
                try {
                    const packageJson = (0, devkit_1.readJsonFile)(packageJsonPath);
                    if (packageJson.type === 'module') {
                        return 'esm';
                    }
                }
                catch {
                    // Fall through to default CJS
                }
            }
        }
        // NodeNext defaults to CJS when no type field or when we can't check
        return 'cjs';
    }
    if (tsConfig.options.module === ts.ModuleKind.ES2015 ||
        tsConfig.options.module === ts.ModuleKind.ES2020 ||
        tsConfig.options.module === ts.ModuleKind.ES2022 ||
        tsConfig.options.module === ts.ModuleKind.ESNext) {
        return 'esm';
    }
    else {
        return 'cjs';
    }
}
function createTypeScriptCompilationOptions(normalizedOptions, context) {
    return {
        outputPath: (0, devkit_1.joinPathFragments)(normalizedOptions.outputPath),
        projectName: context.projectName,
        projectRoot: normalizedOptions.projectRoot,
        rootDir: (0, devkit_1.joinPathFragments)(normalizedOptions.rootDir),
        tsConfig: (0, devkit_1.joinPathFragments)(normalizedOptions.tsConfig),
        watch: normalizedOptions.watch,
        deleteOutputPath: normalizedOptions.clean,
        getCustomTransformers: (0, lib_1.getCustomTrasformersFactory)(normalizedOptions.transformers),
    };
}
async function* tscExecutor(_options, context) {
    const { sourceRoot, root } = context.projectsConfigurations.projects[context.projectName];
    const options = (0, lib_1.normalizeOptions)(_options, context.root, sourceRoot, root);
    const { projectRoot, tmpTsConfig, target, dependencies } = (0, check_dependencies_1.checkDependencies)(context, options.tsConfig);
    if (tmpTsConfig) {
        options.tsConfig = tmpTsConfig;
    }
    const tsLibDependency = (0, compiler_helper_dependency_1.getHelperDependency)(compiler_helper_dependency_1.HelperDependency.tsc, options.tsConfig, dependencies, context.projectGraph);
    if (tsLibDependency) {
        dependencies.push(tsLibDependency);
    }
    const assetHandler = new copy_assets_handler_1.CopyAssetsHandler({
        projectDir: projectRoot,
        rootDir: context.root,
        outputDir: _options.outputPath,
        assets: _options.assets,
        includeIgnoredFiles: _options.includeIgnoredAssetFiles,
    });
    const tsCompilationOptions = createTypeScriptCompilationOptions(options, context);
    const typescriptCompilation = (0, compile_typescript_files_1.compileTypeScriptFiles)(options, tsCompilationOptions, async () => {
        await assetHandler.processAllAssetsOnce();
        if (options.generatePackageJson) {
            (0, update_package_json_1.updatePackageJson)({
                ...options,
                additionalEntryPoints: (0, create_entry_points_1.createEntryPoints)(options.additionalEntryPoints, context.root),
                format: [
                    determineModuleFormatFromTsConfig(options.tsConfig, options.projectRoot, context.root),
                ],
            }, context, target, dependencies);
        }
    });
    if (!(0, devkit_1.isDaemonEnabled)() && options.watch) {
        devkit_1.output.warn({
            title: 'Nx Daemon is not enabled. Assets and package.json files will not be updated when files change.',
        });
    }
    if ((0, devkit_1.isDaemonEnabled)() && options.watch) {
        const disposeWatchAssetChanges = await assetHandler.watchAndProcessOnAssetChange();
        let disposePackageJsonChanges;
        if (options.generatePackageJson) {
            disposePackageJsonChanges = await (0, watch_for_single_file_changes_1.watchForSingleFileChanges)(context.projectName, options.projectRoot, 'package.json', () => (0, update_package_json_1.updatePackageJson)({
                ...options,
                additionalEntryPoints: (0, create_entry_points_1.createEntryPoints)(options.additionalEntryPoints, context.root),
                format: [
                    determineModuleFormatFromTsConfig(options.tsConfig, options.projectRoot, context.root),
                ],
            }, context, target, dependencies));
        }
        const handleTermination = async (exitCode) => {
            await typescriptCompilation.close();
            disposeWatchAssetChanges();
            disposePackageJsonChanges?.();
            process.exit(exitCode);
        };
        process.on('SIGINT', () => handleTermination(128 + 2));
        process.on('SIGTERM', () => handleTermination(128 + 15));
    }
    return yield* typescriptCompilation.iterator;
}
exports.default = tscExecutor;
