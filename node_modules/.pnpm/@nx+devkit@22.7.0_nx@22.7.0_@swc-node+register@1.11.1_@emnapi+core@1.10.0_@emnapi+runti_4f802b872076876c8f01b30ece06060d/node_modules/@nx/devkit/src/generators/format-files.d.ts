import { Tree } from 'nx/src/devkit-exports';
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
export declare function formatFiles(tree: Tree, options?: {
    sortRootTsconfigPaths?: boolean;
}): Promise<void>;
//# sourceMappingURL=format-files.d.ts.map