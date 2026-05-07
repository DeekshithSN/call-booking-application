const require_global = require('./global.cjs');
const require_share = require('./utils/share.cjs');
const require_manifest = require('./utils/manifest.cjs');
const require_load = require('./utils/load.cjs');
require('./utils/index.cjs');
const require_preload = require('./utils/preload.cjs');

//#region src/helpers.ts
const ShareUtils = {
	getRegisteredShare: require_share.getRegisteredShare,
	getGlobalShareScope: require_share.getGlobalShareScope
};
const GlobalUtils = {
	Global: require_global.Global,
	nativeGlobal: require_global.nativeGlobal,
	resetFederationGlobalInfo: require_global.resetFederationGlobalInfo,
	setGlobalFederationInstance: require_global.setGlobalFederationInstance,
	getGlobalFederationConstructor: require_global.getGlobalFederationConstructor,
	setGlobalFederationConstructor: require_global.setGlobalFederationConstructor,
	getInfoWithoutType: require_global.getInfoWithoutType,
	getGlobalSnapshot: require_global.getGlobalSnapshot,
	getTargetSnapshotInfoByModuleInfo: require_global.getTargetSnapshotInfoByModuleInfo,
	getGlobalSnapshotInfoByModuleInfo: require_global.getGlobalSnapshotInfoByModuleInfo,
	setGlobalSnapshotInfoByModuleInfo: require_global.setGlobalSnapshotInfoByModuleInfo,
	addGlobalSnapshot: require_global.addGlobalSnapshot,
	getRemoteEntryExports: require_global.getRemoteEntryExports,
	registerGlobalPlugins: require_global.registerGlobalPlugins,
	getGlobalHostPlugins: require_global.getGlobalHostPlugins,
	getPreloaded: require_global.getPreloaded,
	setPreloaded: require_global.setPreloaded
};
var helpers_default = {
	global: GlobalUtils,
	share: ShareUtils,
	utils: {
		matchRemoteWithNameAndExpose: require_manifest.matchRemoteWithNameAndExpose,
		preloadAssets: require_preload.preloadAssets,
		getRemoteInfo: require_load.getRemoteInfo
	}
};

//#endregion
exports.default = helpers_default;
//# sourceMappingURL=helpers.cjs.map