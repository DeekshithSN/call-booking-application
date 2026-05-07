import { PackageManager, Tree } from 'nx/src/devkit-exports';
/**
 * Runs `npm install` or `yarn install`. It will skip running the install if
 * `package.json` hasn't changed at all or it hasn't changed since the last invocation.
 *
 * @param tree - the file system tree
 * @param ensureInstall - ensure install runs even if `package.json` hasn't changed,
 * unless install already ran this generator cycle.
 */
export declare function installPackagesTask(tree: Tree, ensureInstall?: boolean, cwd?: string, packageManager?: PackageManager): void;
//# sourceMappingURL=install-packages-task.d.ts.map