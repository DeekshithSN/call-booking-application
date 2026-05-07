import { Stats, Manifest, moduleFederationPlugin } from '@module-federation/sdk';
import type { Compilation, Compiler } from 'webpack';
interface GenerateManifestOptions {
    compilation: Compilation;
    stats: Stats;
    publicPath: string;
    compiler: Compiler;
    bundler: 'webpack' | 'rspack';
    additionalData?: moduleFederationPlugin.PluginManifestOptions['additionalData'];
}
declare class ManifestManager {
    private _options;
    init(options: moduleFederationPlugin.ModuleFederationPluginOptions): void;
    get fileName(): string;
    updateManifest(options: GenerateManifestOptions): Manifest;
    generateManifest(options: GenerateManifestOptions): Manifest;
}
export { ManifestManager };
