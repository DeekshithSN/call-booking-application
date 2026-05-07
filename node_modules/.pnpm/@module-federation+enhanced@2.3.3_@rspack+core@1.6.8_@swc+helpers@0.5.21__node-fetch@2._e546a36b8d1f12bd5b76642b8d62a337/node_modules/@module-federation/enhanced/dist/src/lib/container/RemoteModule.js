Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../_virtual/_rolldown/runtime.js');
const require_lib_Constants = require('../Constants.js');
const require_lib_container_runtime_FederationModulesPlugin = require('./runtime/FederationModulesPlugin.js');
const require_lib_container_FallbackDependency = require('./FallbackDependency.js');
const require_lib_container_RemoteToExternalDependency = require('./RemoteToExternalDependency.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/container/RemoteModule.ts
const { sources: webpackSources } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack"));
const { Module, RuntimeGlobals } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack"));
const makeSerializable = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack/lib/util/makeSerializable"));
const TYPES = new Set(["remote", "share-init"]);
const JAVASCRIPT_TYPES = new Set(["javascript"]);
const RUNTIME_REQUIREMENTS = new Set([RuntimeGlobals.module]);
var RemoteModule = class RemoteModule extends Module {
	/**
	* @param {string} request request string
	* @param {string[]} externalRequests list of external requests to containers
	* @param {string} internalRequest name of exposed module in container
	* @param {string|string[]} shareScope scope in which modules are shared
	*/
	constructor(request, externalRequests, internalRequest, shareScope) {
		super(require_lib_Constants.WEBPACK_MODULE_TYPE_REMOTE);
		this.request = request;
		this.externalRequests = externalRequests;
		this.internalRequest = internalRequest;
		this.shareScope = shareScope;
		this._identifier = `remote (${Array.isArray(shareScope) ? shareScope.join("|") : shareScope}) ${this.externalRequests.join(" ")} ${this.internalRequest}`;
	}
	/**
	* @returns {string} a unique identifier of the module
	*/
	identifier() {
		return this._identifier;
	}
	/**
	* @param {RequestShortener} requestShortener the request shortener
	* @returns {string} a user readable identifier of the module
	*/
	readableIdentifier(requestShortener) {
		return `remote ${this.request}`;
	}
	/**
	* @param {LibIdentOptions} options options
	* @returns {string | null} an identifier for library inclusion
	*/
	libIdent(options) {
		return `${this.layer ? `(${this.layer})/` : ""}webpack/container/remote/${this.request}`;
	}
	/**
	* @param {NeedBuildContext} context context info
	* @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
	* @returns {void}
	*/
	needBuild(context, callback) {
		callback(null, !this.buildInfo);
	}
	/**
	* @param {WebpackOptions} options webpack options
	* @param {Compilation} compilation the compilation
	* @param {ResolverWithOptions} resolver the resolver
	* @param {InputFileSystem} fs the file system
	* @param {function(WebpackError=): void} callback callback function
	* @returns {void}
	*/
	build(options, compilation, resolver, fs, callback) {
		this.buildMeta = {};
		this.buildInfo = { strict: true };
		this.clearDependenciesAndBlocks();
		if (this.externalRequests.length === 1) {
			const dep = new require_lib_container_RemoteToExternalDependency.default(this.externalRequests[0]);
			this.addDependency(dep);
			require_lib_container_runtime_FederationModulesPlugin.default.getCompilationHooks(compilation).addRemoteDependency.call(dep);
		} else {
			const dep = new require_lib_container_FallbackDependency.default(this.externalRequests);
			this.addDependency(dep);
			require_lib_container_runtime_FederationModulesPlugin.default.getCompilationHooks(compilation).addRemoteDependency.call(dep);
		}
		callback();
	}
	/**
	* @param {string=} type the source type for which the size should be estimated
	* @returns {number} the estimated size of the module (must be non-zero)
	*/
	size(type) {
		return 6;
	}
	/**
	* @returns {Set<string>} types available (do not mutate)
	*/
	getSourceTypes() {
		return TYPES;
	}
	/**
	* @returns {Set<string>} types available (do not mutate)
	*/
	getSourceBasicTypes() {
		return JAVASCRIPT_TYPES;
	}
	/**
	* @returns {string | null} absolute path which should be used for condition matching (usually the resource path)
	*/
	nameForCondition() {
		return this.request;
	}
	/**
	* @param {CodeGenerationContext} context context for code generation
	* @returns {CodeGenerationResult} result
	*/
	codeGeneration(context) {
		const { moduleGraph, chunkGraph } = context;
		const module = moduleGraph.getModule(this.dependencies[0]);
		const id = module && chunkGraph.getModuleId(module);
		const sources = /* @__PURE__ */ new Map();
		sources.set("remote", new webpackSources.RawSource(""));
		const data = /* @__PURE__ */ new Map();
		data.set("share-init", [{
			shareScope: this.shareScope,
			initStage: 20,
			init: id === void 0 ? "" : `initExternal(${JSON.stringify(id)});`
		}]);
		return {
			sources,
			data,
			runtimeRequirements: RUNTIME_REQUIREMENTS
		};
	}
	serialize(context) {
		const { write } = context;
		write(this.request);
		write(this.externalRequests);
		write(this.internalRequest);
		write(this.shareScope);
		super.serialize(context);
	}
	/**
	* @param {ObjectDeserializerContext} context context
	* @returns {RemoteModule} deserialized module
	*/
	static deserialize(context) {
		const { read } = context;
		const obj = new RemoteModule(read(), read(), read(), read());
		obj.deserialize(context);
		return obj;
	}
};
makeSerializable(RemoteModule, "enhanced/lib/container/RemoteModule");

//#endregion
exports.default = RemoteModule;
//# sourceMappingURL=RemoteModule.js.map