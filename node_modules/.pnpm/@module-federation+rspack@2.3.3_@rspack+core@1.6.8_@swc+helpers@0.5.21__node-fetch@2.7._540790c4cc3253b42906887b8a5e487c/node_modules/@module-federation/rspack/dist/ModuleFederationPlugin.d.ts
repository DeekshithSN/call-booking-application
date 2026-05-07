import type { Compiler, RspackPluginInstance } from '@rspack/core';
import { moduleFederationPlugin } from '@module-federation/sdk';
import { RemoteEntryPlugin } from './RemoteEntryPlugin';
export declare const PLUGIN_NAME = "RspackModuleFederationPlugin";
type ResolveFn = typeof require.resolve;
export declare function resolveRspackRuntimeImplementation(implementation?: string, resolve?: ResolveFn): string;
export declare function resolveRspackRuntimeAlias(implementation: string, resolve?: ResolveFn): string;
export declare class ModuleFederationPlugin implements RspackPluginInstance {
    readonly name = "RspackModuleFederationPlugin";
    private _options;
    private _statsPlugin?;
    constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions);
    private _patchBundlerConfig;
    private _checkSingleton;
    apply(compiler: Compiler): void;
    private _patchChunkSplit;
}
export declare const GetPublicPathPlugin: typeof RemoteEntryPlugin;
export { TreeShakingSharedPlugin, type TreeShakingSharedPluginOptions, } from './TreeShakingSharedPlugin';
