import { Compiler, RspackPluginInstance } from '@rspack/core';
import { ModuleFederationConfig, NxModuleFederationConfigOverride } from '../../../utils/models';
export declare class NxModuleFederationPlugin implements RspackPluginInstance {
    private _options;
    private configOverride?;
    constructor(_options: {
        config: ModuleFederationConfig;
        isServer?: boolean;
    }, configOverride?: NxModuleFederationConfigOverride);
    apply(compiler: Compiler): void;
}
//# sourceMappingURL=nx-module-federation-plugin.d.ts.map