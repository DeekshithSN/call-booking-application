import { error } from "../../utils/logger.js";
import { getRemoteEntryInfoFromSnapshot, isPureRemoteEntry, isRemoteInfoWithEntry } from "../../utils/tool.js";
import "../../utils/index.js";
import { preloadAssets } from "../../utils/preload.js";
import { getResourceUrl, isBrowserEnvValue } from "@module-federation/sdk";
import { RUNTIME_011, runtimeDescMap } from "@module-federation/error-codes";

//#region src/plugins/snapshot/index.ts
function assignRemoteInfo(remoteInfo, remoteSnapshot) {
	const remoteEntryInfo = getRemoteEntryInfoFromSnapshot(remoteSnapshot);
	if (!remoteEntryInfo.url) error(RUNTIME_011, runtimeDescMap, { remoteName: remoteInfo.name });
	let entryUrl = getResourceUrl(remoteSnapshot, remoteEntryInfo.url);
	if (!isBrowserEnvValue && !entryUrl.startsWith("http")) entryUrl = `https:${entryUrl}`;
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
			if (!isRemoteInfoWithEntry(remote) || !isPureRemoteEntry(remote)) {
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
				if (assets) preloadAssets(remoteInfo, origin, assets, false);
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
export { assignRemoteInfo, snapshotPlugin };
//# sourceMappingURL=index.js.map