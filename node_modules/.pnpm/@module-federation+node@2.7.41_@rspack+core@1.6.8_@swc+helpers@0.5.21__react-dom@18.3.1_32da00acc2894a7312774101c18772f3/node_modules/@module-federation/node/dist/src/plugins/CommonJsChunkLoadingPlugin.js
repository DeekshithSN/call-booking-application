Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../_virtual/_rolldown/runtime.js');
const require_src_plugins_DynamicFilesystemChunkLoadingRuntimeModule = require('./DynamicFilesystemChunkLoadingRuntimeModule.js');
const require_src_plugins_RemotePublicPathRuntimeModule = require('./RemotePublicPathRuntimeModule.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/plugins/CommonJsChunkLoadingPlugin.ts
const StartupChunkDependenciesPlugin = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack/lib/runtime/StartupChunkDependenciesPlugin"));
var DynamicFilesystemChunkLoadingPlugin = class {
	constructor(options) {
		this.options = options || {};
		this._asyncChunkLoading = this.options.asyncChunkLoading;
	}
	apply(compiler) {
		const { RuntimeGlobals } = compiler.webpack;
		new StartupChunkDependenciesPlugin({
			chunkLoading: this._asyncChunkLoading ? "async-node" : "require",
			asyncChunkLoading: this._asyncChunkLoading
		}).apply(compiler);
		compiler.hooks.thisCompilation.tap("DynamicFilesystemChunkLoadingPlugin", (compilation) => {
			const isEnabledForChunk = (_) => true;
			const onceForChunkSet = /* @__PURE__ */ new WeakSet();
			const handler = (chunk, set) => {
				if (onceForChunkSet.has(chunk)) return;
				onceForChunkSet.add(chunk);
				if (!isEnabledForChunk(chunk)) return;
				set.add(RuntimeGlobals.moduleFactoriesAddOnly);
				set.add(RuntimeGlobals.hasOwnProperty);
				set.add(RuntimeGlobals.publicPath);
				compilation.addRuntimeModule(chunk, new require_src_plugins_DynamicFilesystemChunkLoadingRuntimeModule.default(set, this.options, { webpack: compiler.webpack }));
			};
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.ensureChunkHandlers).tap("DynamicFilesystemChunkLoadingPlugin", handler);
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.hmrDownloadUpdateHandlers).tap("DynamicFilesystemChunkLoadingPlugin", handler);
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.hmrDownloadManifest).tap("DynamicFilesystemChunkLoadingPlugin", handler);
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.baseURI).tap("DynamicFilesystemChunkLoadingPlugin", handler);
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.externalInstallChunk).tap("DynamicFilesystemChunkLoadingPlugin", handler);
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.onChunksLoaded).tap("DynamicFilesystemChunkLoadingPlugin", handler);
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.ensureChunkHandlers).tap("DynamicFilesystemChunkLoadingPlugin", (chunk, set) => {
				if (!isEnabledForChunk(chunk)) return;
				set.add(RuntimeGlobals.getChunkScriptFilename);
			});
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.hmrDownloadUpdateHandlers).tap("DynamicFilesystemChunkLoadingPlugin", (chunk, set) => {
				if (!isEnabledForChunk(chunk)) return;
				set.add(RuntimeGlobals.getChunkUpdateScriptFilename);
				set.add(RuntimeGlobals.moduleCache);
				set.add(RuntimeGlobals.hmrModuleData);
				set.add(RuntimeGlobals.moduleFactoriesAddOnly);
			});
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.hmrDownloadManifest).tap("DynamicFilesystemChunkLoadingPlugin", (chunk, set) => {
				if (!isEnabledForChunk(chunk)) return;
				set.add(RuntimeGlobals.getUpdateManifestFilename);
			});
			compilation.hooks.runtimeRequirementInTree.for(RuntimeGlobals.publicPath).tap("RuntimePlugin", (chunk, set) => {
				const { outputOptions } = compilation;
				const { publicPath: globalPublicPath, scriptType } = outputOptions;
				const entryOptions = chunk.getEntryOptions();
				const publicPath = entryOptions && entryOptions.publicPath !== void 0 ? entryOptions.publicPath : globalPublicPath;
				const module = new require_src_plugins_RemotePublicPathRuntimeModule.default(this.options);
				if (publicPath === "auto" && scriptType !== "module") set.add(RuntimeGlobals.global);
				else if (typeof publicPath !== "string" || /\[(full)?hash\]/.test(publicPath)) module.fullHash = true;
				compilation.addRuntimeModule(chunk, module);
				return true;
			});
			compilation.hooks.additionalTreeRuntimeRequirements.tap("StartupChunkDependenciesPlugin", (chunk, set, { chunkGraph }) => {});
		});
	}
};

//#endregion
exports.default = DynamicFilesystemChunkLoadingPlugin;
//# sourceMappingURL=CommonJsChunkLoadingPlugin.js.map