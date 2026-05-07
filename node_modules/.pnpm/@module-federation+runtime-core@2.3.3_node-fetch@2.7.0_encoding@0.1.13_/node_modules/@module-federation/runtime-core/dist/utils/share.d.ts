import { SyncWaterfallHook } from "./hooks/syncWaterfallHook.js";
import { Federation } from "../global.js";
import { GlobalShareScopeMap, ShareScopeMap, Shared } from "../type/config.js";
//#region src/utils/share.d.ts
declare function getRegisteredShare(localShareScopeMap: ShareScopeMap, pkgName: string, shareInfo: Shared, resolveShare: SyncWaterfallHook<{
  shareScopeMap: ShareScopeMap;
  scope: string;
  pkgName: string;
  version: string;
  shareInfo: Shared;
  GlobalFederation: Federation;
  resolver: () => {
    shared: Shared;
    useTreesShaking: boolean;
  } | undefined;
}>): {
  shared: Shared;
  useTreesShaking: boolean;
} | void;
declare function getGlobalShareScope(): GlobalShareScopeMap;
//#endregion
export { getGlobalShareScope, getRegisteredShare };
//# sourceMappingURL=share.d.ts.map