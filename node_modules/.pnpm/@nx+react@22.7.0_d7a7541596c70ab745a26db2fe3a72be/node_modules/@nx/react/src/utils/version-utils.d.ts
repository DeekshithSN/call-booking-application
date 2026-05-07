import { type Tree } from '@nx/devkit';
type ReactDependenciesVersions = {
    react: string;
    'react-dom': string;
    'react-is': string;
    '@types/react': string;
    '@types/react-dom': string;
    '@types/react-is': string;
};
export declare function getReactDependenciesVersionsToInstall(tree: Tree): Promise<ReactDependenciesVersions>;
export declare function isReact18(tree: Tree): Promise<boolean>;
export declare function getInstalledReactVersion(tree: Tree): string;
export declare function getInstalledReactVersionFromGraph(): Promise<string>;
export declare function getInstalledReactRouterDevVersion(tree: Tree): string | undefined;
export declare function reactRouterSupportsVite8(tree: Tree): boolean;
export {};
//# sourceMappingURL=version-utils.d.ts.map