Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../../_virtual/_rolldown/runtime.js');
const require_lib_container_runtime_utils = require('../../container/runtime/utils.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/sharing/tree-shaking/IndependentSharedRuntimeModule.ts
const { Template, RuntimeGlobals, RuntimeModule } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack"));
var IndependentSharedRuntimeModule = class extends RuntimeModule {
	constructor(buildAssets, libraryType) {
		super("shared-fallback", RuntimeModule.STAGE_ATTACH);
		this.buildAssets = {};
		this.libraryType = "global";
		this.buildAssets = buildAssets;
		this.libraryType = libraryType;
	}
	/**
	* @returns {string | null} runtime code
	*/
	generate() {
		if (!this.buildAssets || !Object.keys(this.buildAssets).length) return null;
		const federationGlobal = require_lib_container_runtime_utils.getFederationGlobalScope(RuntimeGlobals);
		return Template.asString([
			`if (!${federationGlobal}) return;`,
			`${federationGlobal}.sharedFallback = ${JSON.stringify(this.buildAssets)};`,
			`${federationGlobal}.libraryType = ${JSON.stringify(this.libraryType)};`
		]);
	}
};

//#endregion
exports.default = IndependentSharedRuntimeModule;
//# sourceMappingURL=IndependentSharedRuntimeModule.js.map