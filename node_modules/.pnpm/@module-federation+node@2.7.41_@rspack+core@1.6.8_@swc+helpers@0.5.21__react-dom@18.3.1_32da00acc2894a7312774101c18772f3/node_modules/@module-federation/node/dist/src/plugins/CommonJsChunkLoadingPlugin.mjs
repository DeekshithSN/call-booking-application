import { __require } from "../../_virtual/_rolldown/runtime.mjs";
import DynamicFilesystemChunkLoadingRuntimeModule from "./DynamicFilesystemChunkLoadingRuntimeModule.mjs";
import AutoPublicPathRuntimeModule from "./RemotePublicPathRuntimeModule.mjs";
import { normalizeWebpackPath } from "@module-federation/sdk/normalize-webpack-path";

//#region src/plugins/CommonJsChunkLoadingPlugin.ts
const StartupChunkDependenciesPlugin = __require(normalizeWebpackPath("webpack/lib/runtime/StartupChunkDependenciesPlugin"));
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
				compilation.addRuntimeModule(chunk, new DynamicFilesystemChunkLoadingRuntimeModule(set, this.options, { webpack: compiler.webpack }));
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
				const module = new AutoPublicPathRuntimeModule(this.options);
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
export { DynamicFilesystemChunkLoadingPlugin as default };
//# sourceMappingURL=CommonJsChunkLoadingPlugin.mjs.map