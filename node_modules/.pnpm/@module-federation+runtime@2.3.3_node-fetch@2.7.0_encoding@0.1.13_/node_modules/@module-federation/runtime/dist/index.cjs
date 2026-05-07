Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_runtime = require('./_virtual/_rolldown/runtime.cjs');
const require_utils = require('./utils.cjs');
let _module_federation_runtime_core = require("@module-federation/runtime-core");
let _module_federation_error_codes = require("@module-federation/error-codes");

//#region src/index.ts
function createInstance(options) {
	const instance = new (((0, _module_federation_runtime_core.getGlobalFederationConstructor)()) || _module_federation_runtime_core.ModuleFederation)(options);
	(0, _module_federation_runtime_core.setGlobalFederationInstance)(instance);
	return instance;
}
let FederationInstance = null;
/**
* @deprecated Use createInstance or getInstance instead
*/
function init(options) {
	const instance = require_utils.getGlobalFederationInstance(options.name, options.version);
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
	(0, _module_federation_runtime_core.assert)(FederationInstance, _module_federation_error_codes.RUNTIME_009, _module_federation_error_codes.runtimeDescMap);
	return FederationInstance.loadRemote.apply(FederationInstance, args);
}
function loadShare(...args) {
	(0, _module_federation_runtime_core.assert)(FederationInstance, _module_federation_error_codes.RUNTIME_009, _module_federation_error_codes.runtimeDescMap);
	return FederationInstance.loadShare.apply(FederationInstance, args);
}
function loadShareSync(...args) {
	(0, _module_federation_runtime_core.assert)(FederationInstance, _module_federation_error_codes.RUNTIME_009, _module_federation_error_codes.runtimeDescMap);
	return FederationInstance.loadShareSync.apply(FederationInstance, args);
}
function preloadRemote(...args) {
	(0, _module_federation_runtime_core.assert)(FederationInstance, _module_federation_error_codes.RUNTIME_009, _module_federation_error_codes.runtimeDescMap);
	return FederationInstance.preloadRemote.apply(FederationInstance, args);
}
function registerRemotes(...args) {
	(0, _module_federation_runtime_core.assert)(FederationInstance, _module_federation_error_codes.RUNTIME_009, _module_federation_error_codes.runtimeDescMap);
	return FederationInstance.registerRemotes.apply(FederationInstance, args);
}
function registerPlugins(...args) {
	(0, _module_federation_runtime_core.assert)(FederationInstance, _module_federation_error_codes.RUNTIME_009, _module_federation_error_codes.runtimeDescMap);
	return FederationInstance.registerPlugins.apply(FederationInstance, args);
}
function getInstance() {
	return FederationInstance;
}
function registerShared(...args) {
	(0, _module_federation_runtime_core.assert)(FederationInstance, _module_federation_error_codes.RUNTIME_009, _module_federation_error_codes.runtimeDescMap);
	return FederationInstance.registerShared.apply(FederationInstance, args);
}
(0, _module_federation_runtime_core.setGlobalFederationConstructor)(_module_federation_runtime_core.ModuleFederation);

//#endregion
Object.defineProperty(exports, 'Module', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime_core.Module;
  }
});
exports.ModuleFederation = _module_federation_runtime_core.ModuleFederation;
exports.createInstance = createInstance;
exports.getInstance = getInstance;
Object.defineProperty(exports, 'getRemoteEntry', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime_core.getRemoteEntry;
  }
});
Object.defineProperty(exports, 'getRemoteInfo', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime_core.getRemoteInfo;
  }
});
exports.init = init;
exports.loadRemote = loadRemote;
Object.defineProperty(exports, 'loadScript', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime_core.loadScript;
  }
});
Object.defineProperty(exports, 'loadScriptNode', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime_core.loadScriptNode;
  }
});
exports.loadShare = loadShare;
exports.loadShareSync = loadShareSync;
exports.preloadRemote = preloadRemote;
Object.defineProperty(exports, 'registerGlobalPlugins', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime_core.registerGlobalPlugins;
  }
});
exports.registerPlugins = registerPlugins;
exports.registerRemotes = registerRemotes;
exports.registerShared = registerShared;
//# sourceMappingURL=index.cjs.map