Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../../_virtual/_rolldown/runtime.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/container/runtime/FederationRuntimeDependency.ts
const ModuleDependency = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack/lib/dependencies/ModuleDependency"));
var FederationRuntimeDependency = class extends ModuleDependency {
	constructor(request) {
		super(request);
	}
	get type() {
		return "federation runtime dependency";
	}
};

//#endregion
exports.default = FederationRuntimeDependency;
//# sourceMappingURL=FederationRuntimeDependency.js.map