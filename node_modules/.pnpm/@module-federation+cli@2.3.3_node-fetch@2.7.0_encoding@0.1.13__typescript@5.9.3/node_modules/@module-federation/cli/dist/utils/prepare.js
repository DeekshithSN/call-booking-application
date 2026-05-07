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
  prepareCli: () => (/* binding */ prepareCli)
});

;// CONCATENATED MODULE: external "./logger.js"
const external_logger_js_namespaceObject = require("./logger.js");
var external_logger_js_default = /*#__PURE__*/__webpack_require__.n(external_logger_js_namespaceObject);
;// CONCATENATED MODULE: ./src/utils/prepare.ts

function prepareCli({ welcomeMsg }) {
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'development';
    }
    // Print a blank line to keep the greet log nice.
    // Some package managers automatically output a blank line, some do not.
    const { npm_execpath } = process.env;
    if (!npm_execpath || npm_execpath.includes('npx-cli.js') || npm_execpath.includes('.bun')) {
        console.log();
    }
    external_logger_js_default().info(welcomeMsg);
}

exports.prepareCli = __webpack_exports__.prepareCli;
for(var __webpack_i__ in __webpack_exports__) {
  if(["prepareCli"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
