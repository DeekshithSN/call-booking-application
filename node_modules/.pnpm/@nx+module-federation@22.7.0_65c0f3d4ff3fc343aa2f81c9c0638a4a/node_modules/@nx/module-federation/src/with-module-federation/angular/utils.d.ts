import { ModuleFederationConfig, SharedLibraryConfig } from '../../utils';
/**
 * Default npm packages to always share for Angular projects.
 */
export declare const DEFAULT_ANGULAR_PACKAGES_TO_SHARE: string[];
/**
 * npm packages to avoid sharing in Angular projects.
 */
export declare const DEFAULT_NPM_PACKAGES_TO_AVOID: string[];
/**
 * Applies eager loading to default Angular packages.
 * Exported for backward compatibility.
 */
export declare function applyDefaultEagerPackages(sharedConfig: Record<string, SharedLibraryConfig>, useRspack?: boolean): void;
/**
 * Creates the default remote URL resolver for Angular.
 * Kept for backward compatibility with existing configs.
 */
export declare function getFunctionDeterminateRemoteUrl(isServer?: boolean, useRspack?: boolean): (remote: string) => string;
export declare function getModuleFederationConfig(mfConfig: ModuleFederationConfig, options?: {
    isServer: boolean;
    determineRemoteUrl?: (remote: string) => string;
}, bundler?: 'rspack' | 'webpack'): Promise<import("../../utils/module-federation-config").ModuleFederationConfigResult>;
export declare function getModuleFederationConfigSync(mfConfig: ModuleFederationConfig, options?: {
    isServer: boolean;
    determineRemoteUrl?: (remote: string) => string;
}, useRspack?: boolean): import("../../utils/module-federation-config").ModuleFederationConfigResult;
//# sourceMappingURL=utils.d.ts.map