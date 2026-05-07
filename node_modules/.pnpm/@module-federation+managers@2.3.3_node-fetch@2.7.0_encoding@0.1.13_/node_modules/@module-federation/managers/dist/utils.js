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
  getBuildVersion: () => (/* binding */ getBuildVersion),
  getBuildName: () => (/* binding */ getBuildName),
  parseOptions: () => (/* binding */ parseOptions)
});

;// CONCATENATED MODULE: external "./PKGJsonManager.js"
const external_PKGJsonManager_js_namespaceObject = require("./PKGJsonManager.js");
;// CONCATENATED MODULE: external "./constant.js"
const external_constant_js_namespaceObject = require("./constant.js");
;// CONCATENATED MODULE: ./src/utils.ts


function processFn(options, normalizeSimple, normalizeOptions, fn) {
    const object = (obj)=>{
        for (const [key, value] of Object.entries(obj)){
            if (typeof value === 'string') {
                fn(key, normalizeSimple(value, key));
            } else {
                fn(key, normalizeOptions(value, key));
            }
        }
    };
    const array = (items)=>{
        for (const item of items){
            if (typeof item === 'string') {
                fn(item, normalizeSimple(item, item));
            } else if (item && typeof item === 'object') {
                object(item);
            } else {
                throw new Error('Unexpected options format');
            }
        }
    };
    if (!options) {
        return;
    } else if (Array.isArray(options)) {
        array(options);
    } else if (typeof options === 'object') {
        object(options);
    } else {
        throw new Error('Unexpected options format');
    }
}
function parseOptions(options, normalizeSimple, normalizeOptions) {
    const items = [];
    processFn(options, normalizeSimple, normalizeOptions, (key, value)=>{
        items.push([
            key,
            value
        ]);
    });
    return items;
}
function getBuildVersion(root) {
    if (process.env['MF_BUILD_VERSION']) {
        return process.env['MF_BUILD_VERSION'];
    }
    const pkg = new external_PKGJsonManager_js_namespaceObject.PKGJsonManager().readPKGJson(root);
    if ((pkg === null || pkg === void 0 ? void 0 : pkg['version']) && typeof pkg['version'] === 'string') {
        return pkg['version'];
    }
    return external_constant_js_namespaceObject.LOCAL_BUILD_VERSION;
}
function getBuildName() {
    return process.env['MF_BUILD_NAME'];
}

exports.getBuildName = __webpack_exports__.getBuildName;
exports.getBuildVersion = __webpack_exports__.getBuildVersion;
exports.parseOptions = __webpack_exports__.parseOptions;
for(var __webpack_i__ in __webpack_exports__) {
  if(["getBuildName","getBuildVersion","parseOptions"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
