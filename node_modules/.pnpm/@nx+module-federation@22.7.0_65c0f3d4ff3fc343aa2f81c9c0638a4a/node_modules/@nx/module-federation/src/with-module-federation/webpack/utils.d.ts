import { ModuleFederationConfig } from '../../utils';
/**
 * Creates the default remote URL resolver for webpack.
 * Kept for backward compatibility with existing configs.
 */
export declare function getFunctionDeterminateRemoteUrl(isServer?: boolean): (remote: string) => string;
export declare function getModuleFederationConfig(mfConfig: ModuleFederationConfig, options?: {
    isServer: boolean;
    determineRemoteUrl?: (remote: string) => string;
}, bundler?: 'rspack' | 'webpack'): Promise<import("../../utils/module-federation-config").ModuleFederationConfigResult>;
//# sourceMappingURL=utils.d.ts.map