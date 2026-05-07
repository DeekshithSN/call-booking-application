'use strict';

Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../_virtual/_rolldown/runtime.js');
const require_lib_container_options = require('../container/options.js');
const require_utils = require('../../utils.js');
const require_lib_sharing_ConsumeSharedPlugin = require('./ConsumeSharedPlugin.js');
const require_lib_sharing_ProvideSharedPlugin = require('./ProvideSharedPlugin.js');
const require_schemas_sharing_SharePlugin_check = require('../../schemas/sharing/SharePlugin.check.js');
const require_schemas_sharing_SharePlugin = require('../../schemas/sharing/SharePlugin.js');
let _module_federation_sdk = require("@module-federation/sdk");
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/sharing/SharePlugin.ts
const validate = require_utils.createSchemaValidation((require_schemas_sharing_SharePlugin_check.init_SharePlugin_check(), require_runtime.__toCommonJS(require_schemas_sharing_SharePlugin_check.SharePlugin_check_exports)).validate, () => (require_schemas_sharing_SharePlugin.init_SharePlugin(), require_runtime.__toCommonJS(require_schemas_sharing_SharePlugin.SharePlugin_exports)).default, {
	name: "Share Plugin",
	baseDataPath: "options"
});
function normalizeSharedOptions(shared) {
	return require_lib_container_options.parseOptions(shared, (item, key) => {
		if (typeof item !== "string") throw new Error(`Unexpected array in shared configuration for key "${key}"`);
		return item === key || !(0, _module_federation_sdk.isRequiredVersion)(item) ? { import: item } : {
			import: key,
			requiredVersion: item
		};
	}, (item) => item);
}
function createConsumeShareOptions(normalizedSharedOptions) {
	return normalizedSharedOptions.map(([key, options]) => ({ [key]: {
		import: options.import,
		shareKey: options.shareKey || key,
		shareScope: options.shareScope,
		requiredVersion: options.requiredVersion,
		strictVersion: options.strictVersion,
		singleton: options.singleton,
		packageName: options.packageName,
		eager: options.eager,
		issuerLayer: options.issuerLayer,
		layer: options.layer,
		request: options.request || key,
		exclude: options.exclude,
		include: options.include,
		allowNodeModulesSuffixMatch: options.allowNodeModulesSuffixMatch,
		treeShakingMode: options.treeShaking?.mode
	} }));
}
function createProvideShareOptions(normalizedSharedOptions) {
	return normalizedSharedOptions.filter(([, options]) => options.import !== false).map(([key, options]) => ({ [options.import || key]: {
		shareKey: options.shareKey || key,
		shareScope: options.shareScope,
		version: options.version,
		eager: options.eager,
		requiredVersion: options.requiredVersion,
		strictVersion: options.strictVersion,
		singleton: options.singleton,
		layer: options.layer,
		request: options.request || options.import || key,
		exclude: options.exclude,
		include: options.include,
		allowNodeModulesSuffixMatch: options.allowNodeModulesSuffixMatch,
		treeShakingMode: options.treeShaking?.mode
	} }));
}
var SharePlugin = class {
	constructor(options) {
		validate(options);
		const sharedOptions = normalizeSharedOptions(options.shared);
		const consumes = createConsumeShareOptions(sharedOptions);
		const provides = createProvideShareOptions(sharedOptions);
		this._shareScope = options.shareScope || "default";
		this._consumes = consumes;
		this._provides = provides;
	}
	/**
	* Applies the plugin to the webpack compiler instance
	* @param compiler - The webpack compiler instance
	*/
	apply(compiler) {
		process.env["FEDERATION_WEBPACK_PATH"] = process.env["FEDERATION_WEBPACK_PATH"] || (0, _module_federation_sdk_normalize_webpack_path.getWebpackPath)(compiler);
		new require_lib_sharing_ConsumeSharedPlugin.default({
			shareScope: this._shareScope,
			consumes: this._consumes
		}).apply(compiler);
		new require_lib_sharing_ProvideSharedPlugin.default({
			shareScope: this._shareScope,
			provides: this._provides
		}).apply(compiler);
	}
};

//#endregion
exports.createConsumeShareOptions = createConsumeShareOptions;
exports.createProvideShareOptions = createProvideShareOptions;
exports.default = SharePlugin;
exports.normalizeSharedOptions = normalizeSharedOptions;
//# sourceMappingURL=SharePlugin.js.map