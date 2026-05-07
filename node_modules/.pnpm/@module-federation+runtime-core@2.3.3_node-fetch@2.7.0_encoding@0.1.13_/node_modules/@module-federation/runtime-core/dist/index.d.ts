import { Module } from "./module/index.js";
import { CurrentGlobal, Federation, Global, addGlobalSnapshot, getGlobalFederationConstructor, getGlobalSnapshot, getInfoWithoutType, registerGlobalPlugins, resetFederationGlobalInfo, setGlobalFederationConstructor, setGlobalFederationInstance } from "./global.js";
import { ModuleFederation } from "./core.js";
import { ModuleFederationRuntimePlugin } from "./type/plugin.js";
import { UserOptions } from "./type/config.js";
import { index_d_exports } from "./type/index.js";
import { isStaticResourcesEqual, safeWrapper } from "./utils/tool.js";
import { matchRemoteWithNameAndExpose } from "./utils/manifest.js";
import { assert, error } from "./utils/logger.js";
import { getRemoteEntry, getRemoteInfo } from "./utils/load.js";
import { preloadAssets } from "./utils/preload.js";
import { getRegisteredShare } from "./utils/share.js";
import { IGlobalUtils, IShareUtils } from "./helpers.js";
import { satisfy } from "./utils/semver/index.js";
import { loadScript, loadScriptNode } from "@module-federation/sdk";

//#region src/index.d.ts
declare const helpers: {
  global: IGlobalUtils;
  share: IShareUtils;
  utils: {
    matchRemoteWithNameAndExpose: typeof matchRemoteWithNameAndExpose;
    preloadAssets: typeof preloadAssets;
    getRemoteInfo: typeof getRemoteInfo;
  };
};
//#endregion
export { CurrentGlobal, type Federation, Global, type IGlobalUtils, type IShareUtils, Module, ModuleFederation, type ModuleFederationRuntimePlugin, type UserOptions, addGlobalSnapshot, assert, error, getGlobalFederationConstructor, getGlobalSnapshot, getInfoWithoutType, getRegisteredShare, getRemoteEntry, getRemoteInfo, helpers, isStaticResourcesEqual, loadScript, loadScriptNode, matchRemoteWithNameAndExpose, registerGlobalPlugins, resetFederationGlobalInfo, safeWrapper, satisfy, setGlobalFederationConstructor, setGlobalFederationInstance, index_d_exports as types };
//# sourceMappingURL=index.d.ts.map