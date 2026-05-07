Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('./_virtual/_rolldown/runtime.cjs');
let _module_federation_runtime_core = require("@module-federation/runtime-core");
_module_federation_runtime_core = require_runtime.__toESM(_module_federation_runtime_core);

//#region src/core.ts
var core_default = _module_federation_runtime_core;

//#endregion
exports.default = core_default;
Object.keys(_module_federation_runtime_core).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return _module_federation_runtime_core[k]; }
  });
});

//# sourceMappingURL=core.cjs.map