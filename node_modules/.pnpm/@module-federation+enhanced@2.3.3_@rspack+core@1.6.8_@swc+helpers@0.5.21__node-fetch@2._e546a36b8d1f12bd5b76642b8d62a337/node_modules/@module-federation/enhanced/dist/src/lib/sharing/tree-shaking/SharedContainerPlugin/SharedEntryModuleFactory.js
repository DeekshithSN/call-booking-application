Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../../../_virtual/_rolldown/runtime.js');
const require_lib_sharing_tree_shaking_SharedContainerPlugin_SharedEntryModule = require('./SharedEntryModule.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/sharing/tree-shaking/SharedContainerPlugin/SharedEntryModuleFactory.ts
const ModuleFactory = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack/lib/ModuleFactory"));
var SharedEntryModuleFactory = class extends ModuleFactory {
	/**
	* @param {ModuleFactoryCreateData} data data object
	* @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
	* @returns {void}
	*/
	create(data, callback) {
		const { dependencies } = data;
		const dep = dependencies[0];
		callback(null, { module: new require_lib_sharing_tree_shaking_SharedContainerPlugin_SharedEntryModule.default(dep.name, dep.request) });
	}
};

//#endregion
exports.default = SharedEntryModuleFactory;
//# sourceMappingURL=SharedEntryModuleFactory.js.map