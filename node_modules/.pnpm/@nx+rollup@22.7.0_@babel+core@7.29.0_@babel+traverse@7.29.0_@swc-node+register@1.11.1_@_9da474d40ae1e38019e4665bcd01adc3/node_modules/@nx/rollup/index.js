"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollupProjectGenerator = exports.configurationGenerator = void 0;
const tslib_1 = require("tslib");
const configuration_1 = require("./src/generators/configuration/configuration");
Object.defineProperty(exports, "configurationGenerator", { enumerable: true, get: function () { return configuration_1.configurationGenerator; } });
// Exported for backwards compatibility in case a plugin is using the old name.
/** @deprecated Use `configurationGenerator` instead. */
exports.rollupProjectGenerator = configuration_1.configurationGenerator;
tslib_1.__exportStar(require("./src/generators/init/init"), exports);
tslib_1.__exportStar(require("./src/executors/rollup/rollup.impl"), exports);
