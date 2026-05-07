import { Compiler, RspackPluginInstance } from '@rspack/core';
import { ModuleFederationConfig } from '../../../utils/models';
import { NxModuleFederationDevServerConfig } from '../../models';
export declare class NxModuleFederationSSRDevServerPlugin implements RspackPluginInstance {
    private _options;
    private devServerProcess;
    private nxBin;
    constructor(_options: {
        config: ModuleFederationConfig;
        devServerConfig?: NxModuleFederationDevServerConfig;
    });
    apply(compiler: Compiler): void;
    private startServer;
    private setup;
}
//# sourceMappingURL=nx-module-federation-ssr-dev-server-plugin.d.ts.map