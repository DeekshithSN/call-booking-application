Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../_virtual/_rolldown/runtime.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/plugins/EntryChunkTrackerPlugin.ts
require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack/lib/util/SortableSet"));
var EntryChunkTrackerPlugin = class {
	constructor(options) {
		this._options = options || {};
	}
	apply(compiler) {
		compiler.hooks.thisCompilation.tap("EntryChunkTrackerPlugin", (compilation) => {
			this._handleRenderStartup(compiler, compilation);
		});
	}
	_handleRenderStartup(compiler, compilation) {
		compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(compilation).renderStartup.tap("EntryChunkTrackerPlugin", (source, _renderContext, upperContext) => {
			if (this._options.excludeChunk && this._options.excludeChunk(upperContext.chunk)) return source;
			const templateString = this._getTemplateString(compiler, source);
			return new compiler.webpack.sources.ConcatSource(templateString);
		});
	}
	_getTemplateString(compiler, source) {
		const { Template } = compiler.webpack;
		return Template.asString([`if(typeof module !== 'undefined') {
        globalThis.entryChunkCache = globalThis.entryChunkCache || new Set();
        module.filename && globalThis.entryChunkCache.add(module.filename);
        if(module.children) {
        module.children.forEach(function(c) {
          c.filename && globalThis.entryChunkCache.add(c.filename);
        })
}
      }`, Template.indent(source.source().toString())]);
	}
};

//#endregion
exports.default = EntryChunkTrackerPlugin;
//# sourceMappingURL=EntryChunkTrackerPlugin.js.map