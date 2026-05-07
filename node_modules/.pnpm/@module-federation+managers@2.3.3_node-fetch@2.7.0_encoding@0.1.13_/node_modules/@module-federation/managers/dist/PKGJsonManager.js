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
  PKGJsonManager: () => (/* binding */ PKGJsonManager)
});

;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_namespaceObject);
;// CONCATENATED MODULE: external "find-pkg"
const external_find_pkg_namespaceObject = require("find-pkg");
var external_find_pkg_default = /*#__PURE__*/__webpack_require__.n(external_find_pkg_namespaceObject);
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
var external_fs_default = /*#__PURE__*/__webpack_require__.n(external_fs_namespaceObject);
;// CONCATENATED MODULE: external "@module-federation/sdk"
const sdk_namespaceObject = require("@module-federation/sdk");
;// CONCATENATED MODULE: ./src/PKGJsonManager.ts

// @ts-ignore this pkg miss types



class PKGJsonManager {
    setPKGJson(pkg) {
        this._pkg = pkg;
    }
    readPKGJson(root = process.cwd()) {
        if (this._pkg) {
            return this._pkg;
        }
        try {
            // eslint-disable-next-line no-restricted-globals
            const pkg = JSON.parse(external_fs_default().readFileSync(external_path_default().resolve(root, 'package.json'), 'utf8'));
            this._pkg = pkg;
            return pkg;
        } catch (_err) {
            try {
                const pkg = external_find_pkg_default().sync(root);
                this._pkg = pkg;
                return pkg;
            } catch (err) {
                sdk_namespaceObject.logger.error(err);
                return {};
            }
        }
    }
    getExposeGarfishModuleType(root = process.cwd()) {
        var _pkg_mf;
        const pkg = this.readPKGJson(root);
        return (pkg === null || pkg === void 0 ? void 0 : (_pkg_mf = pkg['mf']) === null || _pkg_mf === void 0 ? void 0 : _pkg_mf.type) === sdk_namespaceObject.MFModuleType.NPM ? sdk_namespaceObject.MFModuleType.NPM : sdk_namespaceObject.MFModuleType.APP;
    }
}

exports.PKGJsonManager = __webpack_exports__.PKGJsonManager;
for(var __webpack_i__ in __webpack_exports__) {
  if(["PKGJsonManager"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
