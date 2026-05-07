Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_runtime = require('./_virtual/_rolldown/runtime.js');
let _module_federation_data_prefetch_react = require("@module-federation/data-prefetch/react");
let _module_federation_data_prefetch_universal = require("@module-federation/data-prefetch/universal");

Object.defineProperty(exports, 'prefetch', {
  enumerable: true,
  get: function () {
    return _module_federation_data_prefetch_universal.prefetch;
  }
});
Object.defineProperty(exports, 'usePrefetch', {
  enumerable: true,
  get: function () {
    return _module_federation_data_prefetch_react.usePrefetch;
  }
});