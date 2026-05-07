"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFiles = formatFiles;
const tslib_1 = require("tslib");
const devkit_exports_1 = require("nx/src/devkit-exports");
const devkit_internals_1 = require("nx/src/devkit-internals");
const path = tslib_1.__importStar(require("path"));
/**
 * Formats all the created or updated files using Prettier
 * @param tree - the file system tree
 * @param options - options for the formatFiles function
 *
 * @remarks
 * Set the environment variable `NX_SKIP_FORMAT` to `true` to skip Prettier
 * formatting. This is useful for repositories that use alternative formatters
 * like Biome, dprint, or have custom formatting requirements.
 *
 * Note: `NX_SKIP_FORMAT` only skips Prettier formatting. TSConfig path sorting
 * (controlled by `sortRootTsconfigPaths` option or `NX_FORMAT_SORT_TSCONFIG_PATHS`)
 * will still occur.
 */
async function formatFiles(tree, options = {}) {
    options.sortRootTsconfigPaths ??=
        process.env.NX_FORMAT_SORT_TSCONFIG_PATHS === 'true';
    if (options.sortRootTsconfigPaths) {
        sortTsConfig(tree);
    }
    // Skip Prettier formatting if NX_SKIP_FORMAT is set
    // This is checked after tsconfig sorting since sorting is a separate concern
    if (process.env.NX_SKIP_FORMAT === 'true') {
        return;
    }
    let prettier;
    try {
        prettier = await Promise.resolve().then(() => tslib_1.__importStar(require('prettier')));
        /**
         * Even after we discovered prettier in node_modules, we need to be sure that the user is intentionally using prettier
         * before proceeding to format with it.
         */
        if (!(0, devkit_internals_1.isUsingPrettierInTree)(tree)) {
            return;
        }
    }
    catch { }
    if (!prettier)
        return;
    const files = new Set(tree.listChanges().filter((file) => file.type !== 'DELETE'));
    const changedPrettierInTree = getChangedPrettierConfigInTree(tree);
    await Promise.all(Array.from(files).map(async (file) => {
        try {
            const systemPath = path.join(tree.root, file.path);
            const resolvedOptions = await prettier.resolveConfig(systemPath, {
                editorconfig: true,
            });
            const options = {
                ...resolvedOptions,
                ...changedPrettierInTree,
                filepath: systemPath,
            };
            if (file.path.endsWith('.swcrc')) {
                options.parser = 'json';
            }
            const support = await prettier.getFileInfo(systemPath, options);
            if (support.ignored || !support.inferredParser) {
                return;
            }
            tree.write(file.path, await prettier.format(file.content.toString('utf-8'), options));
        }
        catch (e) {
            console.warn(`Could not format ${file.path}. Error: "${e.message}"`);
        }
    }));
}
function sortTsConfig(tree) {
    try {
        const tsConfigPath = getRootTsConfigPath(tree);
        if (!tsConfigPath) {
            return;
        }
        const tsconfig = (0, devkit_exports_1.readJson)(tree, tsConfigPath);
        if (!tsconfig.compilerOptions?.paths) {
            // no paths to sort
            return;
        }
        (0, devkit_exports_1.writeJson)(tree, tsConfigPath, {
            ...tsconfig,
            compilerOptions: {
                ...tsconfig.compilerOptions,
                paths: (0, devkit_internals_1.sortObjectByKeys)(tsconfig.compilerOptions.paths),
            },
        });
    }
    catch (e) {
        // catch noop
    }
}
function getRootTsConfigPath(tree) {
    for (const path of ['tsconfig.base.json', 'tsconfig.json']) {
        if (tree.exists(path)) {
            return path;
        }
    }
    return null;
}
function getChangedPrettierConfigInTree(tree) {
    if (tree.listChanges().find((file) => file.path === '.prettierrc')) {
        try {
            return (0, devkit_exports_1.readJson)(tree, '.prettierrc');
        }
        catch {
            return null;
        }
    }
    else {
        return null;
    }
}
