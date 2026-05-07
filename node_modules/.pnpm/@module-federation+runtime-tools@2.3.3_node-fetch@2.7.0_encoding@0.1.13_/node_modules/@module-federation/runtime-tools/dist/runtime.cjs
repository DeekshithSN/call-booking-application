

var _module_federation_runtime = require("@module-federation/runtime");
Object.keys(_module_federation_runtime).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return _module_federation_runtime[k]; }
  });
});
