import { Global, addGlobalSnapshot, getGlobalFederationConstructor, getGlobalHostPlugins, getGlobalSnapshot, getGlobalSnapshotInfoByModuleInfo, getInfoWithoutType, getPreloaded, getRemoteEntryExports, getTargetSnapshotInfoByModuleInfo, registerGlobalPlugins, resetFederationGlobalInfo, setGlobalFederationConstructor, setGlobalFederationInstance, setGlobalSnapshotInfoByModuleInfo, setPreloaded } from "./global.js";
import { getGlobalShareScope, getRegisteredShare } from "./utils/share.js";

//#region src/helpers.d.ts
interface IShareUtils {
  getRegisteredShare: typeof getRegisteredShare;
  getGlobalShareScope: typeof getGlobalShareScope;
}
interface IGlobalUtils {
  Global: typeof Global;
  nativeGlobal: typeof global;
  resetFederationGlobalInfo: typeof resetFederationGlobalInfo;
  setGlobalFederationInstance: typeof setGlobalFederationInstance;
  getGlobalFederationConstructor: typeof getGlobalFederationConstructor;
  setGlobalFederationConstructor: typeof setGlobalFederationConstructor;
  getInfoWithoutType: typeof getInfoWithoutType;
  getGlobalSnapshot: typeof getGlobalSnapshot;
  getTargetSnapshotInfoByModuleInfo: typeof getTargetSnapshotInfoByModuleInfo;
  getGlobalSnapshotInfoByModuleInfo: typeof getGlobalSnapshotInfoByModuleInfo;
  setGlobalSnapshotInfoByModuleInfo: typeof setGlobalSnapshotInfoByModuleInfo;
  addGlobalSnapshot: typeof addGlobalSnapshot;
  getRemoteEntryExports: typeof getRemoteEntryExports;
  registerGlobalPlugins: typeof registerGlobalPlugins;
  getGlobalHostPlugins: typeof getGlobalHostPlugins;
  getPreloaded: typeof getPreloaded;
  setPreloaded: typeof setPreloaded;
}
//#endregion
export { type IGlobalUtils, type IShareUtils };
//# sourceMappingURL=helpers.d.ts.map