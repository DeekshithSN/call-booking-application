
//#region src/constant.ts
const FederationModuleManifest = "federation-manifest.json";
const MANIFEST_EXT = ".json";
const BROWSER_LOG_KEY = "FEDERATION_DEBUG";
const NameTransformSymbol = {
	AT: "@",
	HYPHEN: "-",
	SLASH: "/"
};
const NameTransformMap = {
	[NameTransformSymbol.AT]: "scope_",
	[NameTransformSymbol.HYPHEN]: "_",
	[NameTransformSymbol.SLASH]: "__"
};
const EncodedNameTransformMap = {
	[NameTransformMap[NameTransformSymbol.AT]]: NameTransformSymbol.AT,
	[NameTransformMap[NameTransformSymbol.HYPHEN]]: NameTransformSymbol.HYPHEN,
	[NameTransformMap[NameTransformSymbol.SLASH]]: NameTransformSymbol.SLASH
};
const SEPARATOR = ":";
const ManifestFileName = "mf-manifest.json";
const StatsFileName = "mf-stats.json";
const MFModuleType = {
	NPM: "npm",
	APP: "app"
};
const MODULE_DEVTOOL_IDENTIFIER = "__MF_DEVTOOLS_MODULE_INFO__";
const ENCODE_NAME_PREFIX = "ENCODE_NAME_PREFIX";
const TEMP_DIR = ".federation";
const MFPrefetchCommon = {
	identifier: "MFDataPrefetch",
	globalKey: "__PREFETCH__",
	library: "mf-data-prefetch",
	exportsKey: "__PREFETCH_EXPORTS__",
	fileName: "bootstrap.js"
};
let TreeShakingStatus = /* @__PURE__ */ function(TreeShakingStatus) {
	/**
	* Not handled by deploy server, needs to infer by the real runtime period.
	*/
	TreeShakingStatus[TreeShakingStatus["UNKNOWN"] = 1] = "UNKNOWN";
	/**
	* It means the shared has been calculated , runtime should take this shared as first choice.
	*/
	TreeShakingStatus[TreeShakingStatus["CALCULATED"] = 2] = "CALCULATED";
	/**
	* It means the shared has been calculated, and marked as no used
	*/
	TreeShakingStatus[TreeShakingStatus["NO_USE"] = 0] = "NO_USE";
	return TreeShakingStatus;
}({});

//#endregion
exports.BROWSER_LOG_KEY = BROWSER_LOG_KEY;
exports.ENCODE_NAME_PREFIX = ENCODE_NAME_PREFIX;
exports.EncodedNameTransformMap = EncodedNameTransformMap;
exports.FederationModuleManifest = FederationModuleManifest;
exports.MANIFEST_EXT = MANIFEST_EXT;
exports.MFModuleType = MFModuleType;
exports.MFPrefetchCommon = MFPrefetchCommon;
exports.MODULE_DEVTOOL_IDENTIFIER = MODULE_DEVTOOL_IDENTIFIER;
exports.ManifestFileName = ManifestFileName;
exports.NameTransformMap = NameTransformMap;
exports.NameTransformSymbol = NameTransformSymbol;
exports.SEPARATOR = SEPARATOR;
exports.StatsFileName = StatsFileName;
exports.TEMP_DIR = TEMP_DIR;
exports.TreeShakingStatus = TreeShakingStatus;
//# sourceMappingURL=constant.cjs.map