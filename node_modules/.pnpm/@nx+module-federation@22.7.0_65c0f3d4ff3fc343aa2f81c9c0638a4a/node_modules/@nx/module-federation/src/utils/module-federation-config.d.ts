import { ProjectGraph } from '@nx/devkit';
import { ModuleFederationConfig, SharedLibraryConfig, shareWorkspaceLibraries } from './index';
/**
 * Configuration options for module federation config generation.
 */
export interface ModuleFederationConfigOptions {
    /** Whether this is for server-side rendering */
    isServer?: boolean;
    /** Custom function to determine remote URLs */
    determineRemoteUrl?: (remote: string) => string;
}
/**
 * Framework-specific configuration for module federation.
 */
export interface FrameworkConfig {
    /** Bundler type affects shared library config */
    bundler: 'webpack' | 'rspack';
    /** Remote entry file extension */
    remoteEntryExt: 'js' | 'mjs';
    /** Whether to pass true as 4th param to mapRemotes */
    mapRemotesExpose?: boolean;
    /** Function to apply eager packages for this framework */
    applyEagerPackages?: (sharedConfig: Record<string, SharedLibraryConfig>, projectGraph: ProjectGraph, projectName: string) => void;
    /** Default npm packages to always share */
    defaultPackagesToShare?: string[];
    /** npm packages to exclude from sharing */
    packagesToAvoid?: string[];
}
/**
 * Result of getModuleFederationConfig
 */
export interface ModuleFederationConfigResult {
    sharedLibraries: ReturnType<typeof shareWorkspaceLibraries>;
    sharedDependencies: Record<string, SharedLibraryConfig>;
    mappedRemotes: Record<string, string>;
}
/**
 * Creates a default remote URL resolver function.
 * This is extracted to avoid code duplication across bundler utils.
 */
declare function createDefaultRemoteUrlResolver(isServer?: boolean, remoteEntryExt?: 'js' | 'mjs'): (remote: string) => string;
/**
 * Async version - tries cached graph first, falls back to creating new one.
 * Used by webpack and angular async configs.
 */
export declare function getModuleFederationConfigAsync(mfConfig: ModuleFederationConfig, options: ModuleFederationConfigOptions, frameworkConfig: FrameworkConfig): Promise<ModuleFederationConfigResult>;
/**
 * Sync version - only uses cached graph.
 * Used by rspack and angular sync configs.
 */
export declare function getModuleFederationConfigSync(mfConfig: ModuleFederationConfig, options: ModuleFederationConfigOptions, frameworkConfig: FrameworkConfig): ModuleFederationConfigResult;
/**
 * Clears the static remotes env cache.
 * Useful for testing or when the env variable changes.
 */
export declare function clearStaticRemotesEnvCache(): void;
export { createDefaultRemoteUrlResolver };
//# sourceMappingURL=module-federation-config.d.ts.map