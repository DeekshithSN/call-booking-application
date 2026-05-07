//#region src/constant.d.ts
declare const FederationModuleManifest = "federation-manifest.json";
declare const MANIFEST_EXT = ".json";
declare const BROWSER_LOG_KEY = "FEDERATION_DEBUG";
declare const NameTransformSymbol: {
  readonly AT: "@";
  readonly HYPHEN: "-";
  readonly SLASH: "/";
};
declare const NameTransformMap: {
  readonly "@": "scope_";
  readonly "-": "_";
  readonly "/": "__";
};
declare const EncodedNameTransformMap: {
  scope_: "@";
  _: "-";
  __: "/";
};
declare const SEPARATOR = ":";
declare const ManifestFileName = "mf-manifest.json";
declare const StatsFileName = "mf-stats.json";
declare const MFModuleType: {
  NPM: string;
  APP: string;
};
declare const MODULE_DEVTOOL_IDENTIFIER = "__MF_DEVTOOLS_MODULE_INFO__";
declare const ENCODE_NAME_PREFIX = "ENCODE_NAME_PREFIX";
declare const TEMP_DIR = ".federation";
declare const MFPrefetchCommon: {
  identifier: string;
  globalKey: string;
  library: string;
  exportsKey: string;
  fileName: string;
};
declare const enum TreeShakingStatus {
  /**
   * Not handled by deploy server, needs to infer by the real runtime period.
   */
  UNKNOWN = 1,
  /**
   * It means the shared has been calculated , runtime should take this shared as first choice.
   */
  CALCULATED = 2,
  /**
   * It means the shared has been calculated, and marked as no used
   */
  NO_USE = 0
}
//#endregion
export { BROWSER_LOG_KEY, ENCODE_NAME_PREFIX, EncodedNameTransformMap, FederationModuleManifest, MANIFEST_EXT, MFModuleType, MFPrefetchCommon, MODULE_DEVTOOL_IDENTIFIER, ManifestFileName, NameTransformMap, NameTransformSymbol, SEPARATOR, StatsFileName, TEMP_DIR, TreeShakingStatus };
//# sourceMappingURL=constant.d.ts.map