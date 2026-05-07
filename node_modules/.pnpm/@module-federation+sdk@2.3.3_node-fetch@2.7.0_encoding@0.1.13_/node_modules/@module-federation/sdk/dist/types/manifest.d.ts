import { RemoteWithEntry, RemoteWithVersion } from "./common.js";
import { BasicStatsMetaData, RemoteEntryType, StatsAssets, StatsExpose, StatsMetaData } from "./stats.js";

//#region src/types/manifest.d.ts
interface ManifestShared {
  id: string;
  name: string;
  version: string;
  singleton: boolean;
  requiredVersion: string;
  hash: string;
  assets: StatsAssets;
  fallback?: string;
  fallbackName?: string;
  fallbackType?: RemoteEntryType;
}
interface ManifestRemoteCommonInfo {
  federationContainerName: string;
  moduleName: string;
  alias: string;
}
type ManifestRemote<T = ManifestRemoteCommonInfo> = (Omit<RemoteWithEntry, 'name'> & T) | (Omit<RemoteWithVersion, 'name'> & T);
type ManifestExpose = Pick<StatsExpose, 'assets' | 'id' | 'name' | 'path'>;
interface Manifest<T = BasicStatsMetaData, K = ManifestRemoteCommonInfo> {
  id: string;
  name: string;
  metaData: StatsMetaData<T>;
  shared: ManifestShared[];
  remotes: ManifestRemote<K>[];
  exposes: ManifestExpose[];
}
//#endregion
export { Manifest, ManifestExpose, ManifestRemote, ManifestRemoteCommonInfo, ManifestShared };
//# sourceMappingURL=manifest.d.ts.map