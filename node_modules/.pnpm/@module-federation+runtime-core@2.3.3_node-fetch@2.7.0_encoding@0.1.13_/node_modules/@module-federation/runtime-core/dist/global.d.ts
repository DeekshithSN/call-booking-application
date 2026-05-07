import { ModuleFederation } from "./core.js";
import { ModuleFederationRuntimePlugin } from "./type/plugin.js";
import { GlobalShareScopeMap, Optional, Remote, RemoteEntryExports } from "./type/config.js";
import { GlobalModuleInfo, ModuleInfo } from "@module-federation/sdk";

//#region src/global.d.ts
interface Federation {
  __GLOBAL_PLUGIN__: Array<ModuleFederationRuntimePlugin>;
  __DEBUG_CONSTRUCTOR_VERSION__?: string;
  moduleInfo: GlobalModuleInfo;
  __DEBUG_CONSTRUCTOR__?: typeof ModuleFederation;
  __INSTANCES__: Array<ModuleFederation>;
  __SHARE__: GlobalShareScopeMap;
  __MANIFEST_LOADING__: Record<string, Promise<ModuleInfo>>;
  __PRELOADED_MAP__: Map<string, boolean>;
}
declare const CurrentGlobal: typeof globalThis;
declare const Global: typeof globalThis;
declare global {
  var __FEDERATION__: Federation, __VMOK__: Federation, __GLOBAL_LOADING_REMOTE_ENTRY__: Record<string, undefined | Promise<RemoteEntryExports | void>>;
}
declare function resetFederationGlobalInfo(): void;
declare function setGlobalFederationInstance(FederationInstance: ModuleFederation): void;
declare function getGlobalFederationConstructor(): typeof ModuleFederation | undefined;
declare function setGlobalFederationConstructor(FederationConstructor: typeof ModuleFederation | undefined, isDebug?: boolean): void;
declare function getInfoWithoutType<T extends object>(target: T, key: keyof T): {
  value: T[keyof T] | undefined;
  key: string;
};
declare const getGlobalSnapshot: () => GlobalModuleInfo;
declare const getTargetSnapshotInfoByModuleInfo: (moduleInfo: Optional<Remote, "alias">, snapshot: GlobalModuleInfo) => GlobalModuleInfo[string] | undefined;
declare const getGlobalSnapshotInfoByModuleInfo: (moduleInfo: Optional<Remote, "alias">) => GlobalModuleInfo[string] | undefined;
declare const setGlobalSnapshotInfoByModuleInfo: (remoteInfo: Remote, moduleDetailInfo: GlobalModuleInfo[string]) => GlobalModuleInfo;
declare const addGlobalSnapshot: (moduleInfos: GlobalModuleInfo) => (() => void);
declare const getRemoteEntryExports: (name: string, globalName: string | undefined) => {
  remoteEntryKey: string;
  entryExports: RemoteEntryExports | undefined;
};
declare const registerGlobalPlugins: (plugins: Array<ModuleFederationRuntimePlugin>) => void;
declare const getGlobalHostPlugins: () => Array<ModuleFederationRuntimePlugin>;
declare const getPreloaded: (id: string) => boolean | undefined;
declare const setPreloaded: (id: string) => Map<string, boolean>;
//#endregion
export { CurrentGlobal, Federation, Global, addGlobalSnapshot, getGlobalFederationConstructor, getGlobalHostPlugins, getGlobalSnapshot, getGlobalSnapshotInfoByModuleInfo, getInfoWithoutType, getPreloaded, getRemoteEntryExports, getTargetSnapshotInfoByModuleInfo, registerGlobalPlugins, resetFederationGlobalInfo, setGlobalFederationConstructor, setGlobalFederationInstance, setGlobalSnapshotInfoByModuleInfo, setPreloaded };
//# sourceMappingURL=global.d.ts.map