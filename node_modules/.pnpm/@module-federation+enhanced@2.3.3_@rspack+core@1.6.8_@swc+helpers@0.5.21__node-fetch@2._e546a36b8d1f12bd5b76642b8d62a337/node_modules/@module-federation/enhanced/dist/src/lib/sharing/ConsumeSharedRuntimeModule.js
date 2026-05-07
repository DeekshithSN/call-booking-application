Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../_virtual/_rolldown/runtime.js');
const require_lib_container_runtime_utils = require('../container/runtime/utils.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/sharing/ConsumeSharedRuntimeModule.ts
const { Template, RuntimeGlobals, RuntimeModule } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack"));
var ConsumeSharedRuntimeModule = class extends RuntimeModule {
	/**
	* @param {ReadonlySet<string>} runtimeRequirements runtime requirements
	*/
	constructor(runtimeRequirements) {
		super("consumes", RuntimeModule.STAGE_ATTACH);
		this._runtimeRequirements = runtimeRequirements;
	}
	/**
	* @returns {string | null} runtime code
	*/
	generate() {
		const compilation = this.compilation;
		const chunkGraph = this.chunkGraph;
		const { runtimeTemplate, codeGenerationResults } = compilation;
		if (!codeGenerationResults) return null;
		const chunkToModuleMapping = {};
		const moduleIdToSourceMapping = /* @__PURE__ */ new Map();
		const initialConsumes = [];
		/**
		*
		* @param {Iterable<Module>} modules modules
		* @param {Chunk} chunk the chunk
		* @param {(string | number)[]} list list of ids
		*/
		const addModules = (modules, chunk, list) => {
			for (const m of modules) {
				const module = m;
				const id = chunkGraph.getModuleId(module);
				if (id === null || id === void 0) continue;
				list.push(id);
				const moduleGetter = codeGenerationResults.getSource(module, chunk.runtime, "consume-shared");
				if (!moduleGetter) continue;
				const shareOption = codeGenerationResults.getData(module, chunk.runtime, "consume-shared");
				if (!shareOption) continue;
				moduleIdToSourceMapping.set(id, Template.asString([
					"{",
					Template.indent([
						`fallback: ${moduleGetter.source().toString()},`,
						`shareScope: ${JSON.stringify(Array.isArray(shareOption.shareScope) ? shareOption.shareScope : [shareOption.shareScope || "default"])},`,
						`singleton: ${JSON.stringify(shareOption.shareConfig.singleton)},`,
						`requiredVersion: ${JSON.stringify(shareOption.shareConfig.requiredVersion)},`,
						`strictVersion: ${JSON.stringify(shareOption.shareConfig.strictVersion)},`,
						`eager: ${JSON.stringify(shareOption.shareConfig.eager)},`,
						`layer: ${JSON.stringify(shareOption.shareConfig.layer)},`,
						`shareKey: "${shareOption.shareKey}",`,
						`${shareOption.treeShakingMode ? `treeShakingMode: ${JSON.stringify(shareOption.treeShakingMode)},` : ""}`
					]),
					"}"
				]));
			}
		};
		const allChunks = [...this.chunk?.getAllReferencedChunks() || []];
		for (const chunk of allChunks) {
			const modules = chunkGraph.getChunkModulesIterableBySourceType(chunk, "consume-shared");
			if (!modules) continue;
			if (chunk.id === null || typeof chunk.id === "string" && !chunk.id) continue;
			addModules(modules, chunk, chunkToModuleMapping[chunk.id.toString()] = []);
		}
		for (const chunk of [...this.chunk?.getAllInitialChunks() || []]) {
			const modules = chunkGraph.getChunkModulesIterableBySourceType(chunk, "consume-shared");
			if (!modules) continue;
			addModules(modules, chunk, initialConsumes);
		}
		if (moduleIdToSourceMapping.size === 0) return null;
		const federationGlobal = require_lib_container_runtime_utils.getFederationGlobalScope(RuntimeGlobals);
		return Template.asString([
			"var installedModules = {};",
			`${RuntimeGlobals.require}.consumesLoadingData.moduleIdToConsumeDataMapping = {`,
			Template.indent(Array.from(moduleIdToSourceMapping, ([key, value]) => {
				return `${JSON.stringify(key)}: ${value}`;
			}).join(",\n")),
			"};",
			`var moduleToHandlerMapping = {};`,
			initialConsumes.length > 0 ? Template.asString([`${RuntimeGlobals.require}.consumesLoadingData.initialConsumes = ${JSON.stringify(initialConsumes)};`, `${federationGlobal}.installInitialConsumes = ${runtimeTemplate.returningFunction(Template.asString([
				`${federationGlobal}.bundlerRuntime.installInitialConsumes({`,
				Template.indent([
					`initialConsumes: ${RuntimeGlobals.require}.consumesLoadingData.initialConsumes,`,
					"installedModules:installedModules,",
					`moduleToHandlerMapping,`,
					`webpackRequire: ${RuntimeGlobals.require},`,
					`asyncLoad: typeof options==='object' ? options.asyncLoad : undefined,`
				]),
				`})`
			]), "options")}`]) : "// no consumes in initial chunks",
			this._runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers) ? Template.asString([`${RuntimeGlobals.require}.consumesLoadingData.chunkMapping = ${JSON.stringify(chunkToModuleMapping, null, "	")};`, `${RuntimeGlobals.ensureChunkHandlers}.consumes = ${runtimeTemplate.basicFunction("chunkId, promises", [
				`${federationGlobal}.bundlerRuntime.consumes({`,
				`chunkMapping: ${RuntimeGlobals.require}.consumesLoadingData.chunkMapping,`,
				"installedModules: installedModules,",
				"chunkId: chunkId,",
				`moduleToHandlerMapping,`,
				"promises: promises,",
				`webpackRequire:${RuntimeGlobals.require}`,
				"});"
			])}`]) : "// no chunk loading of consumes"
		]);
	}
};

//#endregion
exports.default = ConsumeSharedRuntimeModule;
//# sourceMappingURL=ConsumeSharedRuntimeModule.js.map