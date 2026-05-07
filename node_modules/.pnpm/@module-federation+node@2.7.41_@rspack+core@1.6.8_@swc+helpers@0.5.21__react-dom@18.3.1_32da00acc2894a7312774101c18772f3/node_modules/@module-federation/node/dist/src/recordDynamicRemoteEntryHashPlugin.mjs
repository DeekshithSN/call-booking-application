//#region src/recordDynamicRemoteEntryHashPlugin.ts
const recordDynamicRemoteEntryHashPlugin = () => ({
	name: "record-dynamic-remote-entry-hash-plugin",
	beforeInit(args) {
		if (!globalThis.mfHashMap) globalThis.mfHashMap = {};
		return args;
	},
	async onLoad(args) {
		const { moduleInstance } = args;
		if (!moduleInstance.remoteInfo) return args;
		const hashmap = globalThis.mfHashMap;
		if (!hashmap) return args;
		const { name, entry } = moduleInstance.remoteInfo;
		if (!hashmap[name]) {
			const hotReloadUtils = await import("./utils/hot-reload.mjs");
			await hotReloadUtils.createFetcher(entry, hotReloadUtils.getFetchModule(), name, (hash) => {
				hashmap[name] = hash;
			});
		}
		return args;
	}
});

//#endregion
export { recordDynamicRemoteEntryHashPlugin as default };
//# sourceMappingURL=recordDynamicRemoteEntryHashPlugin.mjs.map