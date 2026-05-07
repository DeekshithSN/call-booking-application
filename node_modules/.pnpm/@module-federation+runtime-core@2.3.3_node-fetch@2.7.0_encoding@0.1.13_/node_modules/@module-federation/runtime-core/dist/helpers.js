import { Global, addGlobalSnapshot, getGlobalFederationConstructor, getGlobalHostPlugins, getGlobalSnapshot, getGlobalSnapshotInfoByModuleInfo, getInfoWithoutType, getPreloaded, getRemoteEntryExports, getTargetSnapshotInfoByModuleInfo, nativeGlobal, registerGlobalPlugins, resetFederationGlobalInfo, setGlobalFederationConstructor, setGlobalFederationInstance, setGlobalSnapshotInfoByModuleInfo, setPreloaded } from "./global.js";
import { getGlobalShareScope, getRegisteredShare } from "./utils/share.js";
import { matchRemoteWithNameAndExpose } from "./utils/manifest.js";
import { getRemoteInfo } from "./utils/load.js";
import "./utils/index.js";
import { preloadAssets } from "./utils/preload.js";

//#region src/helpers.ts
const ShareUtils = {
	getRegisteredShare,
	getGlobalShareScope
};
const GlobalUtils = {
	Global,
	nativeGlobal,
	resetFederationGlobalInfo,
	setGlobalFederationInstance,
	getGlobalFederationConstructor,
	setGlobalFederationConstructor,
	getInfoWithoutType,
	getGlobalSnapshot,
	getTargetSnapshotInfoByModuleInfo,
	getGlobalSnapshotInfoByModuleInfo,
	setGlobalSnapshotInfoByModuleInfo,
	addGlobalSnapshot,
	getRemoteEntryExports,
	registerGlobalPlugins,
	getGlobalHostPlugins,
	getPreloaded,
	setPreloaded
};
var helpers_default = {
	global: GlobalUtils,
	share: ShareUtils,
	utils: {
		matchRemoteWithNameAndExpose,
		preloadAssets,
		getRemoteInfo
	}
};

//#endregion
export { helpers_default as default };
//# sourceMappingURL=helpers.js.map