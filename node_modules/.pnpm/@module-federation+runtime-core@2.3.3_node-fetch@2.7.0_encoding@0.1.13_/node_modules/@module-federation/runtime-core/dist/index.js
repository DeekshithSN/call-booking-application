import { assert, error } from "./utils/logger.js";
import { isStaticResourcesEqual, safeWrapper } from "./utils/tool.js";
import { CurrentGlobal, Global, addGlobalSnapshot, getGlobalFederationConstructor, getGlobalSnapshot, getInfoWithoutType, registerGlobalPlugins, resetFederationGlobalInfo, setGlobalFederationConstructor, setGlobalFederationInstance } from "./global.js";
import { satisfy } from "./utils/semver/index.js";
import { getRegisteredShare } from "./utils/share.js";
import { matchRemoteWithNameAndExpose } from "./utils/manifest.js";
import { getRemoteEntry, getRemoteInfo } from "./utils/load.js";
import "./utils/index.js";
import helpers_default from "./helpers.js";
import { Module } from "./module/index.js";
import { ModuleFederation } from "./core.js";
import { type_exports } from "./type/index.js";
import { loadScript, loadScriptNode } from "@module-federation/sdk";

//#region src/index.ts
const helpers = helpers_default;

//#endregion
export { CurrentGlobal, Global, Module, ModuleFederation, addGlobalSnapshot, assert, error, getGlobalFederationConstructor, getGlobalSnapshot, getInfoWithoutType, getRegisteredShare, getRemoteEntry, getRemoteInfo, helpers, isStaticResourcesEqual, loadScript, loadScriptNode, matchRemoteWithNameAndExpose, registerGlobalPlugins, resetFederationGlobalInfo, safeWrapper, satisfy, setGlobalFederationConstructor, setGlobalFederationInstance, type_exports as types };
//# sourceMappingURL=index.js.map