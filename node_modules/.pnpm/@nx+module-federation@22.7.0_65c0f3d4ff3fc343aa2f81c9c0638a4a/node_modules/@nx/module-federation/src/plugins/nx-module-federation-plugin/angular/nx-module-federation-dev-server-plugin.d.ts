import { Compiler, RspackPluginInstance } from '@rspack/core';
import { ModuleFederationConfig } from '../../../utils/models';
import { NxModuleFederationDevServerConfig } from '../../models';
export declare class NxModuleFederationDevServerPlugin implements RspackPluginInstance {
    private _options;
    private nxBin;
    constructor(_options: {
        config: ModuleFederationConfig;
        devServerConfig?: NxModuleFederationDevServerConfig;
    });
    apply(compiler: Compiler): void;
    private setup;
}
//# sourceMappingURL=nx-module-federation-dev-server-plugin.d.ts.map