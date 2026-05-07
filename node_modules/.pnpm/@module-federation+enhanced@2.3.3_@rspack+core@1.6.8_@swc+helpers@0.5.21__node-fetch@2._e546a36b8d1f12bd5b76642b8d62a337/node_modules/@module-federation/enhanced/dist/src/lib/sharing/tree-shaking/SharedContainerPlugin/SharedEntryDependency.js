Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../../../_virtual/_rolldown/runtime.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/sharing/tree-shaking/SharedContainerPlugin/SharedEntryDependency.ts
const makeSerializable = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack/lib/util/makeSerializable"));
const { Dependency } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack"));
var SharedEntryDependency = class extends Dependency {
	/**
	* @param {string} name entry name
	* @param {string} request the request of the entry
	*/
	constructor(name, request) {
		super();
		this.name = name;
		this.request = request;
	}
	/**
	* @returns {string | null} an identifier to merge equal requests
	*/
	getResourceIdentifier() {
		return `shared-entry-${this.name}`;
	}
	get type() {
		return "shared entry";
	}
	get category() {
		return "esm";
	}
};
makeSerializable(SharedEntryDependency, "enhanced/lib/container/SharedEntryDependency");

//#endregion
exports.default = SharedEntryDependency;
//# sourceMappingURL=SharedEntryDependency.js.map