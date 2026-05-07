import { BasicStatsMetaData, StatsMetaData, Stats, moduleFederationPlugin } from '@module-federation/sdk';
import { Compilation, Compiler } from 'webpack';
declare class StatsManager {
    private _options;
    private _publicPath?;
    private _pluginVersion?;
    private _bundler;
    private _containerManager;
    private _remoteManager;
    private _sharedManager;
    private _pkgJsonManager;
    private getBuildInfo;
    get fileName(): string;
    setMetaDataPublicPath(metaData: BasicStatsMetaData, compiler: Compiler): StatsMetaData;
    private _getMetaData;
    private _getFilteredModules;
    private _getModuleAssets;
    private _getProvideSharedAssets;
    private _generateStats;
    getPublicPath(compiler: Compiler): string;
    init(options: moduleFederationPlugin.ModuleFederationPluginOptions, { pluginVersion, bundler, }: {
        pluginVersion: string;
        bundler: 'webpack' | 'rspack';
    }): void;
    updateStats(stats: Stats, compiler: Compiler): Stats;
    generateStats(compiler: Compiler, compilation: Compilation): Promise<Stats>;
    validate(compiler: Compiler): boolean;
}
export { StatsManager };
