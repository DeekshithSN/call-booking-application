import { TreeShakingStatus } from "../constant.js";
import { RemoteEntryType, StatsAssets } from "./stats.js";

//#region src/types/snapshot.d.ts
interface BasicModuleInfo {
  dev?: {
    version?: string;
    remotes?: {
      [nameWithType: string]: string;
    };
  };
  version: string;
  buildVersion: string;
  remoteTypes: string;
  remoteTypesZip: string;
  remoteTypesAPI?: string;
  remotesInfo: Record<string, {
    matchedVersion: string;
  }>;
  shared: Array<{
    sharedName: string;
    fallback?: string;
    fallbackName?: string;
    fallbackType?: RemoteEntryType;
    version?: string;
    assets: StatsAssets;
    treeShakingStatus?: TreeShakingStatus;
    secondarySharedTreeShakingEntry?: string;
    secondarySharedTreeShakingName?: string;
  }>;
}
interface BasicProviderModuleInfo extends BasicModuleInfo {
  remoteEntry: string;
  remoteEntryType: RemoteEntryType;
  ssrRemoteEntry?: string;
  ssrRemoteEntryType?: RemoteEntryType;
  globalName: string;
  modules: Array<{
    moduleName: string;
    modulePath?: string;
    assets: StatsAssets;
  }>;
  prefetchInterface?: boolean;
  prefetchEntry?: string;
  prefetchEntryType?: RemoteEntryType;
}
interface BasicProviderModuleInfoWithPublicPath extends BasicProviderModuleInfo {
  publicPath: string;
  ssrPublicPath?: string;
}
interface BasicProviderModuleInfoWithGetPublicPath extends BasicProviderModuleInfo {
  getPublicPath: string;
}
interface ManifestProvider {
  remoteEntry: string;
  ssrRemoteEntry?: string;
  version?: string;
}
interface PureEntryProvider extends ManifestProvider {
  globalName: string;
}
interface BasicConsumerModuleInfo extends BasicModuleInfo {
  consumerList: Array<string>;
}
interface ConsumerModuleInfoWithPublicPath extends BasicConsumerModuleInfo, BasicProviderModuleInfo {
  publicPath: string;
  ssrPublicPath?: string;
}
interface ConsumerModuleInfoWithGetPublicPath extends BasicConsumerModuleInfo, BasicProviderModuleInfo {
  getPublicPath: string;
}
type PureConsumerModuleInfo = Omit<BasicConsumerModuleInfo, 'remoteTypes'>;
type ConsumerModuleInfo = ConsumerModuleInfoWithPublicPath | ConsumerModuleInfoWithGetPublicPath;
type ProviderModuleInfo = BasicProviderModuleInfoWithPublicPath | BasicProviderModuleInfoWithGetPublicPath;
type ModuleInfo = ConsumerModuleInfo | PureConsumerModuleInfo | ProviderModuleInfo;
type GlobalModuleInfo = {
  [key: string]: ModuleInfo | ManifestProvider | PureEntryProvider | undefined;
};
//#endregion
export { BasicProviderModuleInfo, ConsumerModuleInfo, ConsumerModuleInfoWithPublicPath, GlobalModuleInfo, ManifestProvider, ModuleInfo, ProviderModuleInfo, PureConsumerModuleInfo, PureEntryProvider };
//# sourceMappingURL=snapshot.d.ts.map