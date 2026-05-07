"use strict";
const __rslib_import_meta_url__ = /*#__PURE__*/ (function () {
  return typeof document === 'undefined'
    ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href;
})();
;
// The require scope
var __webpack_require__ = {};

/************************************************************************/
// webpack/runtime/compat_get_default_export
(() => {
// getDefaultExport function for compatibility with non-ESM modules
__webpack_require__.n = (module) => {
	var getter = module && module.__esModule ?
		() => (module['default']) :
		() => (module);
	__webpack_require__.d(getter, { a: getter });
	return getter;
};

})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  StatsPlugin: () => (/* binding */ StatsPlugin)
});

;// CONCATENATED MODULE: external "@module-federation/sdk"
const sdk_namespaceObject = require("@module-federation/sdk");
;// CONCATENATED MODULE: external "./ManifestManager.js"
const external_ManifestManager_js_namespaceObject = require("./ManifestManager.js");
;// CONCATENATED MODULE: external "./StatsManager.js"
const external_StatsManager_js_namespaceObject = require("./StatsManager.js");
;// CONCATENATED MODULE: external "./constants.js"
const external_constants_js_namespaceObject = require("./constants.js");
;// CONCATENATED MODULE: external "./logger.js"
const external_logger_js_namespaceObject = require("./logger.js");
var external_logger_js_default = /*#__PURE__*/__webpack_require__.n(external_logger_js_namespaceObject);
;// CONCATENATED MODULE: ./src/StatsPlugin.ts





class StatsPlugin {
    apply(compiler) {
        (0,sdk_namespaceObject.bindLoggerToCompiler)((external_logger_js_default()), compiler, external_constants_js_namespaceObject.PLUGIN_IDENTIFIER);
        if (!this._enable) {
            return;
        }
        const res = this._statsManager.validate(compiler);
        if (!res) {
            return;
        }
        compiler.hooks.thisCompilation.tap('generateStats', (compilation)=>{
            compilation.hooks.processAssets.tapPromise({
                name: 'generateStats',
                // @ts-ignore use runtime variable in case peer dep not installed
                stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER
            }, async ()=>{
                if (this._options.manifest !== false) {
                    const existedStats = compilation.getAsset(this._statsManager.fileName);
                    // new rspack should hit
                    if (existedStats) {
                        let updatedStats = this._statsManager.updateStats(JSON.parse(existedStats.source.source().toString()), compiler);
                        if (typeof this._options.manifest === 'object' && this._options.manifest.additionalData) {
                            updatedStats = await this._options.manifest.additionalData({
                                stats: updatedStats,
                                compiler,
                                compilation,
                                bundler: this._bundler
                            }) || updatedStats;
                        }
                        compilation.updateAsset(this._statsManager.fileName, new compiler.webpack.sources.RawSource(JSON.stringify(updatedStats, null, 2)));
                        const updatedManifest = this._manifestManager.updateManifest({
                            compilation,
                            stats: updatedStats,
                            publicPath: this._statsManager.getPublicPath(compiler),
                            compiler,
                            bundler: this._bundler
                        });
                        const source = new compiler.webpack.sources.RawSource(JSON.stringify(updatedManifest, null, 2));
                        compilation.updateAsset(this._manifestManager.fileName, source);
                        return;
                    }
                    // webpack + legacy rspack
                    let stats = await this._statsManager.generateStats(compiler, compilation);
                    if (typeof this._options.manifest === 'object' && this._options.manifest.additionalData) {
                        stats = await this._options.manifest.additionalData({
                            stats,
                            compiler,
                            compilation,
                            bundler: this._bundler
                        }) || stats;
                    }
                    const manifest = await this._manifestManager.generateManifest({
                        compilation,
                        stats: stats,
                        publicPath: this._statsManager.getPublicPath(compiler),
                        compiler,
                        bundler: this._bundler
                    });
                    compilation.emitAsset(this._statsManager.fileName, new compiler.webpack.sources.RawSource(JSON.stringify(stats, null, 2)));
                    compilation.emitAsset(this._manifestManager.fileName, new compiler.webpack.sources.RawSource(JSON.stringify(manifest, null, 2)));
                }
            });
        });
    }
    constructor(options, { pluginVersion, bundler }){
        this.name = 'StatsPlugin';
        this._options = {};
        this._statsManager = new external_StatsManager_js_namespaceObject.StatsManager();
        this._manifestManager = new external_ManifestManager_js_namespaceObject.ManifestManager();
        this._enable = true;
        this._bundler = 'webpack';
        try {
            this._options = options;
            this._bundler = bundler;
            this._statsManager.init(this._options, {
                pluginVersion,
                bundler
            });
            this._manifestManager.init(this._options);
        } catch (err) {
            if (err instanceof Error) {
                err.message = `[ ${external_constants_js_namespaceObject.PLUGIN_IDENTIFIER} ]: Manifest will not generate, because: ${err.message}`;
            }
            external_logger_js_default().error(err);
            this._enable = false;
        }
    }
}

exports.StatsPlugin = __webpack_exports__.StatsPlugin;
for(var __webpack_i__ in __webpack_exports__) {
  if(["StatsPlugin"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
