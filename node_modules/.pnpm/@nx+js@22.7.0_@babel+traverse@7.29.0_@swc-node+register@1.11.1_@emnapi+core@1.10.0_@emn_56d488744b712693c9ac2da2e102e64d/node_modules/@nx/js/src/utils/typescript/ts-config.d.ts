import { Tree } from '@nx/devkit';
import type * as ts from 'typescript';
export declare function readTsConfig(tsConfigPath: string, sys?: ts.System): ts.ParsedCommandLine;
export declare function readTsConfigFromTree(tree: Tree, tsConfigPath: string): ts.ParsedCommandLine;
export declare function getRootTsConfigPathInTree(tree: Tree): string | null;
export declare function getRelativePathToRootTsConfig(tree: Tree, targetPath: string): string;
export declare function getRootTsConfigPath(): string | null;
export declare function getRootTsConfigFileName(tree?: Tree): string | null;
export declare function addTsConfigPath(tree: Tree, importPath: string, lookupPaths: string[]): void;
/**
 * When `baseUrl` is not set and `paths` are inherited via `extends`,
 * tools like `tsconfig-paths` resolve from the loaded file's directory
 * instead of the file where `paths` is defined. This walks the `extends`
 * chain to find the correct resolution base.
 *
 * Returns the directory that `paths` values should be resolved relative to.
 * Walks the tsconfig `extends` chain to find where `paths` is defined, then
 * looks for the applicable `baseUrl` from that point toward the root of the
 * chain (ignoring child overrides that don't apply to the paths-defining
 * tsconfig). When no `baseUrl` applies, returns the directory of the
 * tsconfig that defines `paths`.
 */
export declare function resolvePathsBaseUrl(tsconfigPath: string): string;
export declare function readTsConfigPaths(tsConfig?: string | ts.ParsedCommandLine): ts.MapLike<string[]>;
//# sourceMappingURL=ts-config.d.ts.map