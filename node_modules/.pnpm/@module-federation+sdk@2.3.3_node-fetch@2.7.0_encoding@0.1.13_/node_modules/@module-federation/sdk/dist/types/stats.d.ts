import { RemoteWithEntry, RemoteWithVersion } from "./common.js";

//#region src/types/stats.d.ts
type RemoteEntryType = 'var' | 'module' | 'assign' | 'assign-properties' | 'this' | 'window' | 'self' | 'global' | 'commonjs' | 'commonjs2' | 'commonjs-module' | 'commonjs-static' | 'amd' | 'amd-require' | 'umd' | 'umd2' | 'jsonp' | 'system' | string;
interface ResourceInfo {
  path: string;
  name: string;
  type: RemoteEntryType;
}
interface StatsBuildInfo {
  buildVersion: string;
  buildName: string;
  target?: string[];
  plugins?: string[];
  excludePlugins?: string[];
}
interface MetaDataTypes {
  path: string;
  name: string;
  api: string;
  zip: string;
}
interface BasicStatsMetaData {
  name: string;
  globalName: string;
  buildInfo: StatsBuildInfo;
  remoteEntry: ResourceInfo;
  ssrRemoteEntry?: ResourceInfo;
  prefetchInterface?: boolean;
  prefetchEntry?: ResourceInfo;
  types?: MetaDataTypes;
  type: string;
  pluginVersion?: string;
}
type StatsMetaDataWithGetPublicPath<T = BasicStatsMetaData> = T & {
  getPublicPath: string;
};
type StatsMetaDataWithPublicPath<T = BasicStatsMetaData> = T & {
  publicPath: string;
  ssrPublicPath?: string;
};
type StatsMetaData<T = BasicStatsMetaData> = StatsMetaDataWithGetPublicPath<T> | StatsMetaDataWithPublicPath<T>;
interface StatsAssets {
  js: StatsAssetsInfo;
  css: StatsAssetsInfo;
}
interface StatsAssetsInfo {
  sync: string[];
  async: string[];
}
interface StatsShared {
  id: string;
  name: string;
  version: string;
  singleton: boolean;
  requiredVersion: string;
  hash: string;
  assets: StatsAssets;
  deps: string[];
  usedIn: string[];
  usedExports: string[];
  fallback: string;
  fallbackName: string;
  fallbackType: RemoteEntryType;
}
interface StatsRemoteVal {
  moduleName: string;
  federationContainerName: string;
  consumingFederationContainerName: string;
  alias: string;
  usedIn: string[];
}
type StatsRemoteWithEntry<T = StatsRemoteVal> = T & Omit<RemoteWithEntry, 'name'>;
type StatsRemoteWithVersion<T = StatsRemoteVal> = T & Omit<RemoteWithVersion, 'name'>;
type StatsRemote<T = StatsRemoteVal> = StatsRemoteWithEntry<T> | StatsRemoteWithVersion<T>;
interface StatsModuleInfo {
  name: string;
  file: string[];
}
interface ManifestModuleInfos {
  [exposeModuleName: string]: StatsModuleInfo;
}
interface StatsExpose {
  id: string;
  name: string;
  path?: string;
  file: string;
  requires: string[];
  assets: StatsAssets;
}
interface Stats<T = BasicStatsMetaData, K = StatsRemoteVal> {
  id: string;
  name: string;
  metaData: StatsMetaData<T>;
  shared: StatsShared[];
  remotes: StatsRemote<K>[];
  exposes: StatsExpose[];
}
//#endregion
export { BasicStatsMetaData, ManifestModuleInfos, MetaDataTypes, RemoteEntryType, ResourceInfo, Stats, StatsAssets, StatsBuildInfo, StatsExpose, StatsMetaData, StatsMetaDataWithGetPublicPath, StatsMetaDataWithPublicPath, StatsModuleInfo, StatsRemote, StatsRemoteVal, StatsRemoteWithEntry, StatsRemoteWithVersion, StatsShared };
//# sourceMappingURL=stats.d.ts.map