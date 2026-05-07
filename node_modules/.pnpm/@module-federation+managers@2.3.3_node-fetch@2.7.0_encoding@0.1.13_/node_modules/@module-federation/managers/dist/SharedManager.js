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
  SharedManager: () => (/* binding */ SharedManager)
});

;// CONCATENATED MODULE: external "find-pkg"
const external_find_pkg_namespaceObject = require("find-pkg");
var external_find_pkg_default = /*#__PURE__*/__webpack_require__.n(external_find_pkg_namespaceObject);
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_namespaceObject);
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
var external_fs_default = /*#__PURE__*/__webpack_require__.n(external_fs_namespaceObject);
;// CONCATENATED MODULE: external "@module-federation/sdk"
const sdk_namespaceObject = require("@module-federation/sdk");
;// CONCATENATED MODULE: external "./BasicPluginOptionsManager.js"
const external_BasicPluginOptionsManager_js_namespaceObject = require("./BasicPluginOptionsManager.js");
;// CONCATENATED MODULE: external "./utils.js"
const external_utils_js_namespaceObject = require("./utils.js");
;// CONCATENATED MODULE: ./src/SharedManager.ts
// @ts-ignore this pkg miss types






class SharedManager extends external_BasicPluginOptionsManager_js_namespaceObject.BasicPluginOptionsManager {
    get enable() {
        return Boolean(Object.keys(this.sharedPluginOptions.shared).length);
    }
    get sharedPluginOptions() {
        const normalizedShared = this.normalizedOptions;
        const shared = Object.keys(normalizedShared).reduce((sum, cur)=>{
            const { singleton, requiredVersion, version, eager, shareScope, import: sharedImport, treeShaking } = normalizedShared[cur];
            sum[cur] = {
                singleton,
                requiredVersion,
                version,
                eager,
                shareScope,
                import: sharedImport,
                treeShaking
            };
            return sum;
        }, {});
        return {
            shared,
            shareScope: this.options.shareScope || 'default'
        };
    }
    findPkg(name, shareConfig) {
        try {
            let pkgPath = '';
            let depName = name;
            if (shareConfig.import) {
                if (external_path_default().isAbsolute(shareConfig.import)) {
                    pkgPath = shareConfig.import;
                } else if (shareConfig.import.startsWith('.')) {
                    pkgPath = external_path_default().resolve(this.root, shareConfig.import);
                }
            } else {
                if (shareConfig.packageName) {
                    depName = shareConfig.packageName;
                }
            }
            pkgPath = pkgPath || require.resolve(depName, {
                paths: [
                    this.root
                ]
            });
            const pkgJsonPath = external_find_pkg_default().sync(pkgPath);
            return {
                pkg: JSON.parse(external_fs_default().readFileSync(pkgJsonPath, 'utf-8')),
                path: '',
                pkgPath: ''
            };
        } catch (err) {
            return {
                pkg: {},
                path: '',
                pkgPath: ''
            };
        }
    }
    get enableTreeShaking() {
        return Object.values(this.normalizedOptions).some((item)=>item.treeShaking);
    }
    transformSharedConfig(sharedConfig) {
        const defaultSharedConfig = {
            singleton: true,
            requiredVersion: undefined,
            shareScope: 'default'
        };
        return {
            ...defaultSharedConfig,
            ...sharedConfig
        };
    }
    normalizeOptions(options) {
        const normalizedShared = {};
        const sharedOptions = (0,external_utils_js_namespaceObject.parseOptions)(options, (item, key)=>{
            if (typeof item !== 'string') throw new Error('Unexpected array in shared');
            const config = item === key || !(0,sdk_namespaceObject.isRequiredVersion)(item) ? {
                import: item
            } : {
                import: key,
                requiredVersion: item
            };
            return config;
        }, (item)=>item);
        sharedOptions.forEach((item)=>{
            const [sharedName, sharedOptions] = item;
            const pkgInfo = this.findPkg(sharedName, sharedOptions);
            const sharedConfig = this.transformSharedConfig(sharedOptions);
            normalizedShared[sharedName] = {
                ...sharedConfig,
                requiredVersion: typeof sharedConfig.requiredVersion !== 'undefined' ? sharedConfig.requiredVersion : `^${pkgInfo.pkg['version']}`,
                name: sharedName,
                version: pkgInfo.pkg['version'],
                eager: Boolean(sharedConfig.eager)
            };
        });
        this.normalizedOptions = normalizedShared;
    }
    init(options) {
        this.setOptions(options);
        this.normalizeOptions(options.shared);
    }
    constructor(...args){
        super(...args), this.normalizedOptions = {};
    }
}


exports.SharedManager = __webpack_exports__.SharedManager;
for(var __webpack_i__ in __webpack_exports__) {
  if(["SharedManager"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
