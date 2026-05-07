import type { Compiler, RspackPluginInstance } from '@rspack/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';
export declare class RemoteEntryPlugin implements RspackPluginInstance {
    readonly name = "VmokRemoteEntryPlugin";
    _options: moduleFederationPlugin.ModuleFederationPluginOptions;
    constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions);
    static addPublicPathEntry(compiler: Compiler, getPublicPath: string, name: string): void;
    apply(compiler: Compiler): void;
}
