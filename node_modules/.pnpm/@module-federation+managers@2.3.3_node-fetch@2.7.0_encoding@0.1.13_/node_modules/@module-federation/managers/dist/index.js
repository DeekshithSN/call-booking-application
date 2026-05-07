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
  UNKNOWN_MODULE_NAME: () => (/* reexport */ external_constant_js_namespaceObject.UNKNOWN_MODULE_NAME),
  PKGJsonManager: () => (/* reexport */ external_PKGJsonManager_js_namespaceObject.PKGJsonManager),
  types: () => (/* reexport */ external_types_js_namespaceObject),
  SharedManager: () => (/* reexport */ external_SharedManager_js_namespaceObject.SharedManager),
  ContainerManager: () => (/* reexport */ external_ContainerManager_js_namespaceObject.ContainerManager),
  BasicPluginOptionsManager: () => (/* reexport */ external_BasicPluginOptionsManager_js_namespaceObject.BasicPluginOptionsManager),
  utils: () => (/* reexport */ external_utils_js_namespaceObject),
  RemoteManager: () => (/* reexport */ external_RemoteManager_js_namespaceObject.RemoteManager)
});

;// CONCATENATED MODULE: external "./BasicPluginOptionsManager.js"
const external_BasicPluginOptionsManager_js_namespaceObject = require("./BasicPluginOptionsManager.js");
;// CONCATENATED MODULE: external "./ContainerManager.js"
const external_ContainerManager_js_namespaceObject = require("./ContainerManager.js");
;// CONCATENATED MODULE: external "./PKGJsonManager.js"
const external_PKGJsonManager_js_namespaceObject = require("./PKGJsonManager.js");
;// CONCATENATED MODULE: external "./RemoteManager.js"
const external_RemoteManager_js_namespaceObject = require("./RemoteManager.js");
;// CONCATENATED MODULE: external "./SharedManager.js"
const external_SharedManager_js_namespaceObject = require("./SharedManager.js");
;// CONCATENATED MODULE: external "./constant.js"
const external_constant_js_namespaceObject = require("./constant.js");
;// CONCATENATED MODULE: external "./utils.js"
const external_utils_js_namespaceObject = require("./utils.js");
;// CONCATENATED MODULE: external "./types.js"
const external_types_js_namespaceObject = require("./types.js");
;// CONCATENATED MODULE: ./src/index.ts









exports.BasicPluginOptionsManager = __webpack_exports__.BasicPluginOptionsManager;
exports.ContainerManager = __webpack_exports__.ContainerManager;
exports.PKGJsonManager = __webpack_exports__.PKGJsonManager;
exports.RemoteManager = __webpack_exports__.RemoteManager;
exports.SharedManager = __webpack_exports__.SharedManager;
exports.UNKNOWN_MODULE_NAME = __webpack_exports__.UNKNOWN_MODULE_NAME;
exports.types = __webpack_exports__.types;
exports.utils = __webpack_exports__.utils;
for(var __webpack_i__ in __webpack_exports__) {
  if(["BasicPluginOptionsManager","ContainerManager","PKGJsonManager","RemoteManager","SharedManager","UNKNOWN_MODULE_NAME","types","utils"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
