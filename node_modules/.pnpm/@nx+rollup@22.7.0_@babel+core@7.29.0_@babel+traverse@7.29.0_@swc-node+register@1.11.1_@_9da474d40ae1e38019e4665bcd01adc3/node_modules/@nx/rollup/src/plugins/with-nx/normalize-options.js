"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
function normalizeOptions(projectRoot, sourceRoot, options) {
    if (global.NX_GRAPH_CREATION)
        return options;
    normalizeRelativePaths(projectRoot, options);
    // New TS Solution already has a typecheck target
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)()) {
        options.skipTypeCheck = true;
    }
    return {
        ...options,
        additionalEntryPoints: (0, js_1.createEntryPoints)(options.additionalEntryPoints, devkit_1.workspaceRoot),
        allowJs: options.allowJs ?? false,
        assets: options.assets
            ? normalizeAssets(options.assets, devkit_1.workspaceRoot, sourceRoot)
            : [],
        babelUpwardRootMode: options.babelUpwardRootMode ?? false,
        compiler: options.compiler ?? 'babel',
        deleteOutputPath: options.deleteOutputPath ?? true,
        extractCss: options.extractCss ?? true,
        format: options.format ? Array.from(new Set(options.format)) : undefined,
        generateExportsField: options.generateExportsField ?? false,
        javascriptEnabled: options.javascriptEnabled ?? false,
        skipTypeCheck: options.skipTypeCheck ?? false,
        skipTypeField: options.skipTypeField ?? false,
        /**
         * TODO(v23): Update default to true
         * This defaults to false for pure plugin usage to match what is the current behaviour for users
         * However, this differs from the Rollup executor usage as it defaulted to `true` in the `schema.json`
         */
        buildLibsFromSource: options.buildLibsFromSource ?? false,
    };
}
function normalizeAssets(assets, root, sourceRoot) {
    return assets.map((asset) => {
        if (typeof asset === 'string') {
            const assetPath = (0, devkit_1.normalizePath)(asset);
            const resolvedAssetPath = (0, node_path_1.resolve)(root, assetPath);
            const resolvedSourceRoot = (0, node_path_1.resolve)(root, sourceRoot);
            if (!resolvedAssetPath.startsWith(resolvedSourceRoot)) {
                throw new Error(`The ${resolvedAssetPath} asset path must start with the project source root: ${sourceRoot}`);
            }
            const isDirectory = (0, node_fs_1.statSync)(resolvedAssetPath).isDirectory();
            const input = isDirectory
                ? resolvedAssetPath
                : (0, node_path_1.dirname)(resolvedAssetPath);
            const output = (0, node_path_1.relative)(resolvedSourceRoot, (0, node_path_1.resolve)(root, input));
            const glob = isDirectory ? '**/*' : (0, node_path_1.basename)(resolvedAssetPath);
            return {
                input,
                output,
                glob,
            };
        }
        else {
            if (asset.output.startsWith('..')) {
                throw new Error('An asset cannot be written to a location outside of the output path.');
            }
            const assetPath = (0, devkit_1.normalizePath)(asset.input);
            const resolvedAssetPath = (0, node_path_1.resolve)(root, assetPath);
            return {
                ...asset,
                input: resolvedAssetPath,
                // Now we remove starting slash to make Webpack place it from the output root.
                output: asset.output.replace(/^\//, ''),
            };
        }
    });
}
function normalizeRelativePaths(projectRoot, options) {
    for (const [fieldName, fieldValue] of Object.entries(options)) {
        if (isRelativePath(fieldValue)) {
            options[fieldName] = (0, devkit_1.normalizePath)((0, node_path_1.join)(projectRoot, fieldValue));
        }
        else if (Array.isArray(fieldValue)) {
            for (let i = 0; i < fieldValue.length; i++) {
                if (isRelativePath(fieldValue[i])) {
                    fieldValue[i] = (0, devkit_1.normalizePath)((0, node_path_1.join)(projectRoot, fieldValue[i]));
                }
            }
        }
    }
}
function isRelativePath(val) {
    return typeof val === 'string' && val.startsWith('.');
}
