import { Remote, Shared, SharedGetter, UserOptions } from "./runtime-core/dist/type/config.js";
import { ExternalsType } from "./sdk/dist/types/plugins/ModuleFederationPlugin.js";
import { initializeSharing } from "./initializeSharing.js";
import { attachShareScopeMap } from "./attachShareScopeMap.js";
import { initContainerEntry } from "./initContainerEntry.js";
import { ConsumesLoadingData, ConsumesOptions, CoreRemotesOptions, Federation, GetSharedFallbackGetterOptions, HandleInitialConsumesOptions, IdToExternalAndNameMapping, IdToRemoteMap, IdToRemoteMapItem, InitContainerEntryOptions, InitializeSharingData, InitializeSharingOptions, InstallInitialConsumesOptions, ModuleId, ModuleIdToRemoteDataMapping, RemoteChunkMapping, RemoteDataItem, RemoteEntryExports, RemoteInfos, RemotesLoadingData, RemotesOptions, ShareScopeMap, WebpackRequire } from "./types.js";
import * as runtime from "@module-federation/runtime";

//#region src/index.d.ts
declare const federation: Federation;
declare const instance: runtime.ModuleFederation | undefined;
declare const initOptions: (Omit<UserOptions, "remotes"> & {
  remotes: Array<Remote & {
    externalType: ExternalsType;
  }>;
}) | undefined;
declare const bundlerRuntime: {
  remotes: (options: RemotesOptions) => void;
  consumes: (options: ConsumesOptions) => void;
  I: typeof initializeSharing;
  S: {
    [scope: string]: {
      [pkgName: string]: {
        [sharedVersion: string]: Shared;
      };
    };
  };
  installInitialConsumes: (options: InstallInitialConsumesOptions) => any;
  initContainerEntry: typeof initContainerEntry;
  init: ({
    webpackRequire,
    libraryType
  }: {
    webpackRequire: WebpackRequire;
    libraryType: string;
  }) => void;
  getSharedFallbackGetter: (options: GetSharedFallbackGetterOptions) => SharedGetter;
} | undefined;
declare const bundlerRuntimeOptions: {
  remotes?: Exclude<RemotesOptions, "chunkId" | "promises"> & {
    remoteInfos?: RemoteInfos;
  };
};
//#endregion
export { ConsumesLoadingData, ConsumesOptions, CoreRemotesOptions, Federation, GetSharedFallbackGetterOptions, HandleInitialConsumesOptions, IdToExternalAndNameMapping, IdToRemoteMap, IdToRemoteMapItem, InitContainerEntryOptions, InitializeSharingData, InitializeSharingOptions, InstallInitialConsumesOptions, ModuleId, ModuleIdToRemoteDataMapping, RemoteChunkMapping, RemoteDataItem, RemoteEntryExports, RemoteInfos, RemotesLoadingData, RemotesOptions, ShareScopeMap, WebpackRequire, attachShareScopeMap, bundlerRuntime, bundlerRuntimeOptions, federation as default, initOptions, instance, runtime };
//# sourceMappingURL=index.d.ts.map