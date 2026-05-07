const require_runtime = require('./_virtual/_rolldown/runtime.cjs');
let _module_federation_runtime = require("@module-federation/runtime");
_module_federation_runtime = require_runtime.__toESM(_module_federation_runtime);

module.exports = _module_federation_runtime;
Object.keys(_module_federation_runtime).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return _module_federation_runtime[k]; }
  });
});
