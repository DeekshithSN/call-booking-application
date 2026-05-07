Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });


var _module_federation_runtime_core_types = require("@module-federation/runtime-core/types");
Object.keys(_module_federation_runtime_core_types).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return _module_federation_runtime_core_types[k]; }
  });
});
