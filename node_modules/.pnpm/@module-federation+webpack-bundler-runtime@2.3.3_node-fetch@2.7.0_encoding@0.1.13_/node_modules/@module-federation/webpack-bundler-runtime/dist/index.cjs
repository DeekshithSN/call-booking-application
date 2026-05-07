Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('./_virtual/_rolldown/runtime.cjs');
const require_attachShareScopeMap = require('./attachShareScopeMap.cjs');
const require_remotes = require('./remotes.cjs');
const require_consumes = require('./consumes.cjs');
const require_initializeSharing = require('./initializeSharing.cjs');
const require_installInitialConsumes = require('./installInitialConsumes.cjs');
const require_initContainerEntry = require('./initContainerEntry.cjs');
const require_init = require('./init.cjs');
const require_getSharedFallbackGetter = require('./getSharedFallbackGetter.cjs');
let _module_federation_runtime = require("@module-federation/runtime");
_module_federation_runtime = require_runtime.__toESM(_module_federation_runtime);

//#region src/index.ts
const federation = {
	runtime: _module_federation_runtime,
	instance: void 0,
	initOptions: void 0,
	bundlerRuntime: {
		remotes: require_remotes.remotes,
		consumes: require_consumes.consumes,
		I: require_initializeSharing.initializeSharing,
		S: {},
		installInitialConsumes: require_installInitialConsumes.installInitialConsumes,
		initContainerEntry: require_initContainerEntry.initContainerEntry,
		init: require_init.init,
		getSharedFallbackGetter: require_getSharedFallbackGetter.getSharedFallbackGetter
	},
	attachShareScopeMap: require_attachShareScopeMap.attachShareScopeMap,
	bundlerRuntimeOptions: {}
};
const instance = federation.instance;
const initOptions = federation.initOptions;
const bundlerRuntime = federation.bundlerRuntime;
const bundlerRuntimeOptions = federation.bundlerRuntimeOptions;

//#endregion
exports.attachShareScopeMap = require_attachShareScopeMap.attachShareScopeMap;
exports.bundlerRuntime = bundlerRuntime;
exports.bundlerRuntimeOptions = bundlerRuntimeOptions;
exports.default = federation;
exports.initOptions = initOptions;
exports.instance = instance;
Object.defineProperty(exports, 'runtime', {
  enumerable: true,
  get: function () {
    return _module_federation_runtime;
  }
});
//# sourceMappingURL=index.cjs.map