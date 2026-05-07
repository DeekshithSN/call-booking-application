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
  ContainerManager: () => (/* binding */ ContainerManager)
});

;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_namespaceObject);
;// CONCATENATED MODULE: external "@module-federation/sdk"
const sdk_namespaceObject = require("@module-federation/sdk");
;// CONCATENATED MODULE: external "./utils.js"
const external_utils_js_namespaceObject = require("./utils.js");
;// CONCATENATED MODULE: external "./BasicPluginOptionsManager.js"
const external_BasicPluginOptionsManager_js_namespaceObject = require("./BasicPluginOptionsManager.js");
;// CONCATENATED MODULE: ./src/ContainerManager.ts




function normalizeExposeModuleName(exposeKey) {
    const relativePath = external_path_default().relative('.', exposeKey);
    if (!relativePath) {
        return 'ExposeEntry';
    }
    return relativePath;
}
class ContainerManager extends external_BasicPluginOptionsManager_js_namespaceObject.BasicPluginOptionsManager {
    get enable() {
        return Boolean(this.options.name && this.options.exposes && (Array.isArray(this.options.exposes) ? this.options.exposes.length > 0 : Object.keys(this.options.exposes).length > 0));
    }
    get globalEntryName() {
        const { name, library } = this.options;
        if (library) {
            if (typeof library.name === 'string') {
                return library.name;
            }
            return name;
        }
        return name;
    }
    get containerPluginExposesOptions() {
        const { exposes } = this.options;
        const parsedOptions = (0,external_utils_js_namespaceObject.parseOptions)(exposes, (item, key)=>({
                import: Array.isArray(item) ? item : [
                    item
                ],
                name: (0,sdk_namespaceObject.generateExposeFilename)(key, false)
            }), (item, key)=>({
                import: Array.isArray(item.import) ? item.import : [
                    item.import
                ],
                name: item.name || (0,sdk_namespaceObject.generateExposeFilename)(key, false)
            }));
        return parsedOptions.reduce((sum, item)=>{
            const [exposeKey, exposeObj] = item;
            sum[exposeKey] = exposeObj;
            return sum;
        }, {});
    }
    // { '.' : './src/Button.jsx', './backup': './src/Button.jsx' } => { './src/Button' : ['.','./backup'] }
    get fileExposeKeyMap() {
        const parsedOptions = this._parseOptions();
        return parsedOptions.reduce((sum, item)=>{
            const [exposeKey, exposeObject] = item;
            exposeObject.import.forEach((exposeFile)=>{
                const exposeFileWithoutExt = exposeFile.replace(external_path_default().extname(exposeFile), '');
                sum[exposeFileWithoutExt] ||= new Set();
                sum[exposeFileWithoutExt].add(exposeKey);
            });
            return sum;
        }, {});
    }
    // { '.' : './src/Button.jsx' } => { '__federation_expose_Component' : ['src/Buttton'] }
    get exposeFileNameImportMap() {
        const { exposes } = this.options;
        const parsedOptions = (0,external_utils_js_namespaceObject.parseOptions)(exposes, (item, key)=>({
                import: Array.isArray(item) ? item : [
                    item
                ],
                name: (0,sdk_namespaceObject.generateExposeFilename)(key, false)
            }), (item, key)=>({
                import: Array.isArray(item.import) ? item.import : [
                    item.import
                ],
                name: item.name || (0,sdk_namespaceObject.generateExposeFilename)(key, false)
            }));
        return parsedOptions.reduce((sum, item)=>{
            const [_exposeKey, exposeObj] = item;
            const { name, import: importPath } = exposeObj;
            sum[name] = importPath;
            return sum;
        }, {});
    }
    // { '.' : './src/Button.jsx' } => { '.' : ['src/Button'] }
    get exposeObject() {
        const parsedOptions = this._parseOptions();
        return parsedOptions.reduce((sum, item)=>{
            const [exposeKey, exposeObject] = item;
            sum[exposeKey] = [];
            exposeObject.import.forEach((item)=>{
                const relativePath = external_path_default().relative('.', item.replace(external_path_default().extname(item), ''));
                sum[exposeKey].push(relativePath);
            });
            return sum;
        }, {});
    }
    // { '.' : './src/Button.jsx' } => ['./src/Button.jsx']
    get exposeFiles() {
        const parsedOptions = this._parseOptions();
        return parsedOptions.reduce((sum, item)=>{
            const [_exposeKey, exposeObject] = item;
            sum.push(...exposeObject.import);
            return sum;
        }, []);
    }
    get manifestModuleInfos() {
        if (this._manifestModuleInfos) {
            return this._manifestModuleInfos;
        }
        // { '.' : './src/Button.jsx' } => { '.' : {  name: 'ExposeEntry', file: './src/Button.jsx', requires: {} } }
        const parsedOptions = this._parseOptions();
        this._manifestModuleInfos = parsedOptions.reduce((sum, item)=>{
            const [exposeKey, exposeObject] = item;
            sum[exposeKey] = {
                name: exposeObject.name || normalizeExposeModuleName(exposeKey),
                file: exposeObject.import
            };
            return sum;
        }, {});
        return this._manifestModuleInfos;
    }
    // { '.' : './src/Button.jsx' } => { index: ['./src/Button.jsx'] }
    get webpackEntry() {
        return Object.values(this.manifestModuleInfos).reduce((sum, cur)=>{
            const entry = cur.name === 'ExposeEntry' ? 'index' : cur.name.slice(0, 1).toLowerCase() + cur.name.slice(1);
            sum[entry] = cur.file;
            return sum;
        }, {});
    }
    _parseOptions() {
        if (this._parsedOptions) {
            return this._parsedOptions;
        }
        this._parsedOptions = (0,external_utils_js_namespaceObject.parseOptions)(this.options.exposes, (item)=>({
                import: Array.isArray(item) ? item : [
                    item
                ],
                name: undefined
            }), (item)=>({
                import: Array.isArray(item.import) ? item.import : [
                    item.import
                ],
                name: undefined
            }));
        return this._parsedOptions;
    }
    init(options) {
        this.setOptions(options);
        this.validate(options.name);
    }
    validate(name) {
        if (!name) {
            throw new Error(`container name can not be empty!`);
        }
    }
}


exports.ContainerManager = __webpack_exports__.ContainerManager;
for(var __webpack_i__ in __webpack_exports__) {
  if(["ContainerManager"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
