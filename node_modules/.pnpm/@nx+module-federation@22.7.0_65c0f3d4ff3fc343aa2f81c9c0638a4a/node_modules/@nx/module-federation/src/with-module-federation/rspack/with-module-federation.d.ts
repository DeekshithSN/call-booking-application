import type { Configuration } from '@rspack/core';
import { ModuleFederationConfig, NxModuleFederationConfigOverride } from '../../utils';
/**
 * @param {ModuleFederationConfig} options
 * @param {NxModuleFederationConfigOverride} configOverride
 */
export declare function withModuleFederation(options: ModuleFederationConfig, configOverride?: NxModuleFederationConfigOverride): Promise<(config: Configuration, { context }: {
    context: any;
}) => Configuration>;
//# sourceMappingURL=with-module-federation.d.ts.map