Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_logger = require('./utils/logger.cjs');
const require_tool = require('./utils/tool.cjs');
const require_global = require('./global.cjs');
const require_index = require('./utils/semver/index.cjs');
const require_share = require('./utils/share.cjs');
const require_manifest = require('./utils/manifest.cjs');
const require_load = require('./utils/load.cjs');
require('./utils/index.cjs');
const require_helpers = require('./helpers.cjs');
const require_index$2 = require('./module/index.cjs');
const require_core = require('./core.cjs');
const require_index$3 = require('./type/index.cjs');
let _module_federation_sdk = require("@module-federation/sdk");

//#region src/index.ts
const helpers = require_helpers.default;

//#endregion
exports.CurrentGlobal = require_global.CurrentGlobal;
exports.Global = require_global.Global;
exports.Module = require_index$2.Module;
exports.ModuleFederation = require_core.ModuleFederation;
exports.addGlobalSnapshot = require_global.addGlobalSnapshot;
exports.assert = require_logger.assert;
exports.error = require_logger.error;
exports.getGlobalFederationConstructor = require_global.getGlobalFederationConstructor;
exports.getGlobalSnapshot = require_global.getGlobalSnapshot;
exports.getInfoWithoutType = require_global.getInfoWithoutType;
exports.getRegisteredShare = require_share.getRegisteredShare;
exports.getRemoteEntry = require_load.getRemoteEntry;
exports.getRemoteInfo = require_load.getRemoteInfo;
exports.helpers = helpers;
exports.isStaticResourcesEqual = require_tool.isStaticResourcesEqual;
Object.defineProperty(exports, 'loadScript', {
  enumerable: true,
  get: function () {
    return _module_federation_sdk.loadScript;
  }
});
Object.defineProperty(exports, 'loadScriptNode', {
  enumerable: true,
  get: function () {
    return _module_federation_sdk.loadScriptNode;
  }
});
exports.matchRemoteWithNameAndExpose = require_manifest.matchRemoteWithNameAndExpose;
exports.registerGlobalPlugins = require_global.registerGlobalPlugins;
exports.resetFederationGlobalInfo = require_global.resetFederationGlobalInfo;
exports.safeWrapper = require_tool.safeWrapper;
exports.satisfy = require_index.satisfy;
exports.setGlobalFederationConstructor = require_global.setGlobalFederationConstructor;
exports.setGlobalFederationInstance = require_global.setGlobalFederationInstance;
Object.defineProperty(exports, 'types', {
  enumerable: true,
  get: function () {
    return require_index$3.type_exports;
  }
});
//# sourceMappingURL=index.cjs.map