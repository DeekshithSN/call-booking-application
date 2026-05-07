Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_runtime = require('./_virtual/_rolldown/runtime.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/utils.ts
const memoize = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack/lib/util/memoize"));
const getValidate = memoize(() => require("schema-utils").validate);
/**
* @template {object | object[]} T
* @param {(function(T): boolean) | undefined} check check
* @param {() => JsonObject} getSchema get schema fn
* @param {ValidationErrorConfiguration} options options
* @returns {function(T=): void} validate
*/
const createSchemaValidation = (check, getSchema, options) => {
	getSchema = memoize(getSchema);
	return (value) => {
		if (check && !check(
			/** @type {T} */
			value
		)) {
			getValidate()(
				getSchema(),
				/** @type {object | object[]} */
				value,
				options
			);
			require("util").deprecate(
				/* istanbul ignore next - deprecation warning */
				function noop() {},
				"webpack bug: Pre-compiled schema reports error while real schema is happy. This has performance drawbacks.",
				"DEP_WEBPACK_PRE_COMPILED_SCHEMA_INVALID"
			)();
		}
	};
};

//#endregion
exports.createSchemaValidation = createSchemaValidation;
//# sourceMappingURL=utils.js.map