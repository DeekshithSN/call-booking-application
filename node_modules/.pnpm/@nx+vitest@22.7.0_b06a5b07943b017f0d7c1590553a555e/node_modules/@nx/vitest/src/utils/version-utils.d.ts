import type { Tree } from 'nx/src/generators/tree';
type VitestDependenciesVersions = {
    vitest: string;
    vitestUi: string;
    vitestCoverageV8: string;
    vitestCoverageIstanbul: string;
};
export declare function getVitestDependenciesVersionsToInstall(tree: Tree): Promise<VitestDependenciesVersions>;
export declare function isVitestV3(tree: Tree): Promise<boolean>;
export declare function isVitestV2(tree: Tree): Promise<boolean>;
export declare function getInstalledVitestVersion(tree: Tree): string;
export declare function getInstalledViteVersion(tree: Tree): string;
export declare function getInstalledViteMajorVersion(tree: Tree): 5 | 6 | 7 | 8 | undefined;
export declare function getInstalledVitestVersionFromGraph(): Promise<string>;
export {};
//# sourceMappingURL=version-utils.d.ts.map