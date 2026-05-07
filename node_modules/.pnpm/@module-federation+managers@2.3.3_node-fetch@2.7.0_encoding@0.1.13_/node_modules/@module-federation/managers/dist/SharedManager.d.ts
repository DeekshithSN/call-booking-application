import { moduleFederationPlugin, sharePlugin } from '@module-federation/sdk';
import { NormalizedSharedOptions } from './types';
import { BasicPluginOptionsManager } from './BasicPluginOptionsManager';
declare class SharedManager extends BasicPluginOptionsManager<moduleFederationPlugin.ModuleFederationPluginOptions> {
    normalizedOptions: NormalizedSharedOptions;
    get enable(): boolean;
    get sharedPluginOptions(): sharePlugin.SharePluginOptions;
    findPkg(name: string, shareConfig: moduleFederationPlugin.SharedConfig): {
        pkg: Record<string, any>;
        path: string;
        pkgPath: string;
    };
    get enableTreeShaking(): boolean;
    transformSharedConfig(sharedConfig: moduleFederationPlugin.SharedConfig): moduleFederationPlugin.SharedConfig;
    normalizeOptions(options: moduleFederationPlugin.ModuleFederationPluginOptions['shared']): void;
    init(options: moduleFederationPlugin.ModuleFederationPluginOptions): void;
}
export { SharedManager };
