import { type Tree } from '@nx/devkit';
export declare const latestVersions: {
    nxVersion: any;
    jestVersion: string;
    babelJestVersion: string;
    jestTypesVersion: string;
    tsJestVersion: string;
    tslibVersion: string;
    swcJestVersion: string;
    typesNodeVersion: string;
    tsNodeVersion: string;
};
declare const supportedMajorVersions: readonly [29, 30];
type SupportedVersions = (typeof supportedMajorVersions)[number];
type PackageVersionNames = keyof typeof latestVersions;
export type VersionMap = {
    [key in SupportedVersions]: Record<PackageVersionNames, string>;
};
export declare const versionMap: VersionMap;
export declare function versions(tree: Tree): any;
export declare function getInstalledJestVersion(tree?: Tree): string | null;
export declare function getInstalledJestVersionInfo(tree?: Tree): {
    version: string | null;
    major: number | null;
};
export declare function getInstalledJestMajorVersion(tree?: Tree): number | null;
export declare function validateInstalledJestVersion(tree?: Tree): void;
export {};
//# sourceMappingURL=versions.d.ts.map