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
  RemoteManager: () => (/* binding */ RemoteManager)
});

;// CONCATENATED MODULE: external "@module-federation/sdk"
const sdk_namespaceObject = require("@module-federation/sdk");
;// CONCATENATED MODULE: external "./BasicPluginOptionsManager.js"
const external_BasicPluginOptionsManager_js_namespaceObject = require("./BasicPluginOptionsManager.js");
;// CONCATENATED MODULE: external "./constant.js"
const external_constant_js_namespaceObject = require("./constant.js");
;// CONCATENATED MODULE: ./src/RemoteManager.ts



function getEntry(remoteObj) {
    if (typeof remoteObj === 'string') {
        return remoteObj;
    }
    if (typeof remoteObj.external === 'string') {
        return remoteObj.external;
    }
    throw new Error('Not support "array" remote value yet!');
}
class RemoteManager extends external_BasicPluginOptionsManager_js_namespaceObject.BasicPluginOptionsManager {
    get enable() {
        return Boolean(this.remotes && (Array.isArray(this.remotes) ? this.remotes.length > 0 : Object.keys(this.remotes).length > 0));
    }
    get statsRemoteWithEmptyUsedIn() {
        const { name } = this.options;
        return Object.keys(this.normalizedOptions).reduce((sum, cur)=>{
            const normalizedOption = this.normalizedOptions[cur];
            let curObj;
            if ('entry' in normalizedOption) {
                curObj = {
                    entry: normalizedOption.entry,
                    alias: normalizedOption.alias,
                    moduleName: external_constant_js_namespaceObject.UNKNOWN_MODULE_NAME,
                    federationContainerName: normalizedOption.name,
                    consumingFederationContainerName: name,
                    usedIn: [
                        external_constant_js_namespaceObject.UNKNOWN_MODULE_NAME
                    ]
                };
            } else {
                curObj = {
                    alias: normalizedOption.alias,
                    moduleName: external_constant_js_namespaceObject.UNKNOWN_MODULE_NAME,
                    version: normalizedOption.version,
                    federationContainerName: normalizedOption.name,
                    consumingFederationContainerName: name,
                    usedIn: [
                        external_constant_js_namespaceObject.UNKNOWN_MODULE_NAME
                    ]
                };
            }
            sum.push(curObj);
            return sum;
        }, []);
    }
    // 'micro-app-sub3': 'app:@garfish/micro-app-sub3:0.0.4',
    // ↓↓↓
    //  {
    //   'micro-app-sub3': @garfish/micro-app-sub3:0.0.4
    // }
    get dtsRemotes() {
        return Object.keys(this.normalizedOptions).reduce((sum, remoteAlias)=>{
            const remoteInfo = this.normalizedOptions[remoteAlias];
            sum[remoteAlias] = (0,sdk_namespaceObject.composeKeyWithSeparator)(remoteInfo.name, 'entry' in remoteInfo ? remoteInfo.entry : remoteInfo.version);
            return sum;
        }, {});
    }
    get remotes() {
        return this.options.remotes;
    }
    // INFO: only support remoteType: script now
    normalizeOptions(options = {}) {
        this.normalizedOptions = Object.keys(options).reduce((sum, remoteAlias)=>{
            if (Array.isArray(options)) {
                return sum;
            }
            const remoteInfo = options[remoteAlias];
            if (Array.isArray(remoteInfo)) {
                return sum;
            }
            let parsedOptions;
            try {
                parsedOptions = (0,sdk_namespaceObject.parseEntry)(typeof remoteInfo === 'string' ? remoteInfo : getEntry(remoteInfo), '', '@');
            } catch (e) {
            // noop
            }
            if (!parsedOptions) {
                return sum;
            }
            sum[remoteAlias] = {
                ...parsedOptions,
                alias: remoteAlias,
                shareScope: typeof remoteInfo === 'object' ? remoteInfo.shareScope || 'default' : 'default'
            };
            return sum;
        }, {});
    }
    init(options) {
        this.setOptions(options);
        this.normalizeOptions(options.remotes);
    }
    constructor(...args){
        super(...args), this.normalizedOptions = {};
    }
}


exports.RemoteManager = __webpack_exports__.RemoteManager;
for(var __webpack_i__ in __webpack_exports__) {
  if(["RemoteManager"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
