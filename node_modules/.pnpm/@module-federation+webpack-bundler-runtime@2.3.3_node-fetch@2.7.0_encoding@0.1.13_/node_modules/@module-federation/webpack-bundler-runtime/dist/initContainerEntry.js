//#region src/initContainerEntry.ts
function initContainerEntry(options) {
	const { webpackRequire, shareScope, initScope, shareScopeKey, remoteEntryInitOptions } = options;
	if (!webpackRequire.S) return;
	if (!webpackRequire.federation || !webpackRequire.federation.instance || !webpackRequire.federation.initOptions) return;
	const federationInstance = webpackRequire.federation.instance;
	federationInstance.initOptions({
		name: webpackRequire.federation.initOptions.name,
		remotes: [],
		...remoteEntryInitOptions
	});
	const hostShareScopeKeys = remoteEntryInitOptions?.shareScopeKeys;
	const hostShareScopeMap = remoteEntryInitOptions?.shareScopeMap;
	if (!shareScopeKey || typeof shareScopeKey === "string") {
		const key = shareScopeKey || "default";
		if (Array.isArray(hostShareScopeKeys)) hostShareScopeKeys.forEach((hostKey) => {
			if (!hostShareScopeMap[hostKey]) hostShareScopeMap[hostKey] = {};
			const sc = hostShareScopeMap[hostKey];
			federationInstance.initShareScopeMap(hostKey, sc, { hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {} });
		});
		else federationInstance.initShareScopeMap(key, shareScope, { hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {} });
	} else shareScopeKey.forEach((key) => {
		if (!hostShareScopeKeys || !hostShareScopeMap) {
			federationInstance.initShareScopeMap(key, shareScope, { hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {} });
			return;
		}
		if (!hostShareScopeMap[key]) hostShareScopeMap[key] = {};
		const sc = hostShareScopeMap[key];
		federationInstance.initShareScopeMap(key, sc, { hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {} });
	});
	if (webpackRequire.federation.attachShareScopeMap) webpackRequire.federation.attachShareScopeMap(webpackRequire);
	if (typeof webpackRequire.federation.prefetch === "function") webpackRequire.federation.prefetch();
	if (!Array.isArray(shareScopeKey)) return webpackRequire.I(shareScopeKey || "default", initScope);
	if (Boolean(webpackRequire.federation.initOptions.shared)) return webpackRequire.I(shareScopeKey, initScope);
	return Promise.all(shareScopeKey.map((key) => {
		return webpackRequire.I(key, initScope);
	})).then(() => true);
}

//#endregion
export { initContainerEntry };
//# sourceMappingURL=initContainerEntry.js.map