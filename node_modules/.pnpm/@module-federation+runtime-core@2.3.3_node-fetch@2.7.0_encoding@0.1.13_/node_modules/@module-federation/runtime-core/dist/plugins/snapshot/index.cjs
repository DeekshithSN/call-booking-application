const require_logger = require('../../utils/logger.cjs');
const require_tool = require('../../utils/tool.cjs');
require('../../utils/index.cjs');
const require_preload = require('../../utils/preload.cjs');
let _module_federation_sdk = require("@module-federation/sdk");
let _module_federation_error_codes = require("@module-federation/error-codes");

//#region src/plugins/snapshot/index.ts
function assignRemoteInfo(remoteInfo, remoteSnapshot) {
	const remoteEntryInfo = require_tool.getRemoteEntryInfoFromSnapshot(remoteSnapshot);
	if (!remoteEntryInfo.url) require_logger.error(_module_federation_error_codes.RUNTIME_011, _module_federation_error_codes.runtimeDescMap, { remoteName: remoteInfo.name });
	let entryUrl = (0, _module_federation_sdk.getResourceUrl)(remoteSnapshot, remoteEntryInfo.url);
	if (!_module_federation_sdk.isBrowserEnvValue && !entryUrl.startsWith("http")) entryUrl = `https:${entryUrl}`;
	remoteInfo.type = remoteEntryInfo.type;
	remoteInfo.entryGlobalName = remoteEntryInfo.globalName;
	remoteInfo.entry = entryUrl;
	remoteInfo.version = remoteSnapshot.version;
	remoteInfo.buildVersion = remoteSnapshot.buildVersion;
}
function snapshotPlugin() {
	return {
		name: "snapshot-plugin",
		async afterResolve(args) {
			const { remote, pkgNameOrAlias, expose, origin, remoteInfo, id } = args;
			if (!require_tool.isRemoteInfoWithEntry(remote) || !require_tool.isPureRemoteEntry(remote)) {
				const { remoteSnapshot, globalSnapshot } = await origin.snapshotHandler.loadRemoteSnapshotInfo({
					moduleInfo: remote,
					id
				});
				assignRemoteInfo(remoteInfo, remoteSnapshot);
				const preloadOptions = {
					remote,
					preloadConfig: {
						nameOrAlias: pkgNameOrAlias,
						exposes: [expose],
						resourceCategory: "sync",
						share: false,
						depsRemote: false
					}
				};
				const assets = await origin.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit({
					origin,
					preloadOptions,
					remoteInfo,
					remote,
					remoteSnapshot,
					globalSnapshot
				});
				if (assets) require_preload.preloadAssets(remoteInfo, origin, assets, false);
				return {
					...args,
					remoteSnapshot
				};
			}
			return args;
		}
	};
}

//#endregion
exports.assignRemoteInfo = assignRemoteInfo;
exports.snapshotPlugin = snapshotPlugin;
//# sourceMappingURL=index.cjs.map