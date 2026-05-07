Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_runtime = require('./_virtual/_rolldown/runtime.cjs');
const require_index = require('./index.cjs');
let _module_federation_runtime_core = require("@module-federation/runtime-core");

Object.defineProperty(exports, 'Module', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime_core.Module;
  }
});
exports.ModuleFederation = _module_federation_runtime_core.ModuleFederation;
exports.createInstance = require_index.createInstance;
exports.getInstance = require_index.getInstance;
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
exports.init = require_index.init;
exports.loadRemote = require_index.loadRemote;
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
exports.loadShare = require_index.loadShare;
exports.loadShareSync = require_index.loadShareSync;
exports.preloadRemote = require_index.preloadRemote;
Object.defineProperty(exports, 'registerGlobalPlugins', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime_core.registerGlobalPlugins;
  }
});
exports.registerPlugins = require_index.registerPlugins;
exports.registerRemotes = require_index.registerRemotes;
exports.registerShared = require_index.registerShared;