Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('./_virtual/_rolldown/runtime.cjs');
const require_utils = require('./utils.cjs');
let _module_federation_runtime_core = require("@module-federation/runtime-core");

//#region src/helpers.ts
const global = {
	..._module_federation_runtime_core.helpers.global,
	getGlobalFederationInstance: require_utils.getGlobalFederationInstance
};
const share = _module_federation_runtime_core.helpers.share;
const utils = _module_federation_runtime_core.helpers.utils;
const runtimeHelpers = {
	global,
	share,
	utils
};

//#endregion
exports.default = runtimeHelpers;
exports.global = global;
exports.share = share;
exports.utils = utils;
//# sourceMappingURL=helpers.cjs.map