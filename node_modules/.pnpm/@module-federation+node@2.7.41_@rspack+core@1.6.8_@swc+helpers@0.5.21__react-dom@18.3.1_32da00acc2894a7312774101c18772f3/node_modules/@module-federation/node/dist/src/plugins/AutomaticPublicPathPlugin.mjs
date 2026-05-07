import AutoPublicPathRuntimeModule from "./RemotePublicPathRuntimeModule.mjs";

//#region src/plugins/AutomaticPublicPathPlugin.ts
var RemotePublicPathPlugin = class {
	constructor(options) {
		this.options = options;
	}
	apply(compiler) {
		const { RuntimeGlobals } = compiler.webpack;
		compiler.hooks.thisCompilation.tap("RemotePublicPathPlugin", (compilation) => {
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
		});
	}
};

//#endregion
export { RemotePublicPathPlugin as default };
//# sourceMappingURL=AutomaticPublicPathPlugin.mjs.map