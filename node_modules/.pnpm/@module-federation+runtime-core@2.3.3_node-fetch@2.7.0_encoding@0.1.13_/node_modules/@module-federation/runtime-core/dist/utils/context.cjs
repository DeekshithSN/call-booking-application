
//#region src/utils/context.ts
function remoteToEntry(r) {
	return {
		name: r.name,
		alias: r.alias,
		entry: "entry" in r ? r.entry : void 0,
		version: "version" in r ? r.version : void 0,
		type: r.type,
		entryGlobalName: r.entryGlobalName,
		shareScope: r.shareScope
	};
}
/**
* Build a partial MFContext from runtime Options.
* Used to enrich diagnostic entries with host context at error sites.
*/
function optionsToMFContext(options) {
	const shared = {};
	for (const [pkgName, versions] of Object.entries(options.shared)) {
		const first = versions[0];
		if (first) shared[pkgName] = {
			version: first.version,
			singleton: first.shareConfig?.singleton,
			requiredVersion: first.shareConfig?.requiredVersion === false ? false : first.shareConfig?.requiredVersion,
			eager: first.eager,
			strictVersion: first.shareConfig?.strictVersion
		};
	}
	return {
		project: {
			name: options.name,
			mfRole: options.remotes?.length > 0 ? "host" : "unknown"
		},
		mfConfig: {
			name: options.name,
			remotes: options.remotes?.map(remoteToEntry) ?? [],
			shared
		}
	};
}

//#endregion
exports.optionsToMFContext = optionsToMFContext;
//# sourceMappingURL=context.cjs.map