import { getGlobalFederationInstance } from "./utils.js";
import { Module, ModuleFederation, assert, getGlobalFederationConstructor, getRemoteEntry, getRemoteInfo, loadScript, loadScriptNode, registerGlobalPlugins, setGlobalFederationConstructor, setGlobalFederationInstance } from "@module-federation/runtime-core";
import { RUNTIME_009, runtimeDescMap } from "@module-federation/error-codes";

//#region src/index.ts
function createInstance(options) {
	const instance = new ((getGlobalFederationConstructor()) || ModuleFederation)(options);
	setGlobalFederationInstance(instance);
	return instance;
}
let FederationInstance = null;
/**
* @deprecated Use createInstance or getInstance instead
*/
function init(options) {
	const instance = getGlobalFederationInstance(options.name, options.version);
	if (!instance) {
		FederationInstance = createInstance(options);
		return FederationInstance;
	} else {
		instance.initOptions(options);
		if (!FederationInstance) FederationInstance = instance;
		return instance;
	}
}
function loadRemote(...args) {
	assert(FederationInstance, RUNTIME_009, runtimeDescMap);
	return FederationInstance.loadRemote.apply(FederationInstance, args);
}
function loadShare(...args) {
	assert(FederationInstance, RUNTIME_009, runtimeDescMap);
	return FederationInstance.loadShare.apply(FederationInstance, args);
}
function loadShareSync(...args) {
	assert(FederationInstance, RUNTIME_009, runtimeDescMap);
	return FederationInstance.loadShareSync.apply(FederationInstance, args);
}
function preloadRemote(...args) {
	assert(FederationInstance, RUNTIME_009, runtimeDescMap);
	return FederationInstance.preloadRemote.apply(FederationInstance, args);
}
function registerRemotes(...args) {
	assert(FederationInstance, RUNTIME_009, runtimeDescMap);
	return FederationInstance.registerRemotes.apply(FederationInstance, args);
}
function registerPlugins(...args) {
	assert(FederationInstance, RUNTIME_009, runtimeDescMap);
	return FederationInstance.registerPlugins.apply(FederationInstance, args);
}
function getInstance() {
	return FederationInstance;
}
function registerShared(...args) {
	assert(FederationInstance, RUNTIME_009, runtimeDescMap);
	return FederationInstance.registerShared.apply(FederationInstance, args);
}
setGlobalFederationConstructor(ModuleFederation);

//#endregion
export { Module, ModuleFederation, createInstance, getInstance, getRemoteEntry, getRemoteInfo, init, loadRemote, loadScript, loadScriptNode, loadShare, loadShareSync, preloadRemote, registerGlobalPlugins, registerPlugins, registerRemotes, registerShared };
//# sourceMappingURL=index.js.map