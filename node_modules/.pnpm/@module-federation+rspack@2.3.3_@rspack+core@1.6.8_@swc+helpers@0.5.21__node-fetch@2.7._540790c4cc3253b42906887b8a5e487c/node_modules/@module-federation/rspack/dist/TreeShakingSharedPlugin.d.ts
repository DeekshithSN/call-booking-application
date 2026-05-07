import type { Compiler, RspackPluginInstance } from '@rspack/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';
export declare const PLUGIN_NAME = "RspackTreeShakingSharedPlugin";
export interface TreeShakingSharedPluginOptions {
    mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
    secondary?: boolean;
}
export declare class TreeShakingSharedPlugin implements RspackPluginInstance {
    readonly name = "RspackTreeShakingSharedPlugin";
    private _options;
    constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions);
    apply(compiler: Compiler): void;
}
