import { Manifest } from "./types/manifest.js";
import { ManifestProvider, ModuleInfo, ProviderModuleInfo } from "./types/snapshot.js";
import { ModuleFederationPluginOptions } from "./types/plugins/ModuleFederationPlugin.js";
//#region src/generateSnapshotFromManifest.d.ts
interface IOptions {
  remotes?: Record<string, string>;
  overrides?: Record<string, string>;
  version?: string;
}
declare const simpleJoinRemoteEntry: (rPath: string, rName: string) => string;
declare function inferAutoPublicPath(url: string): string;
declare function generateSnapshotFromManifest(manifest: Manifest, options?: IOptions): ProviderModuleInfo;
declare function isManifestProvider(moduleInfo: ModuleInfo | ManifestProvider): moduleInfo is ManifestProvider;
declare function getManifestFileName(manifestOptions?: ModuleFederationPluginOptions['manifest']): {
  statsFileName: string;
  manifestFileName: string;
};
//#endregion
export { generateSnapshotFromManifest, getManifestFileName, inferAutoPublicPath, isManifestProvider, simpleJoinRemoteEntry };
//# sourceMappingURL=generateSnapshotFromManifest.d.ts.map