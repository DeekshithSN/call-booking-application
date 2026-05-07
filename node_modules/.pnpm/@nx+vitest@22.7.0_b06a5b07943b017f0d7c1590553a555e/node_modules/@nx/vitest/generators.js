"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurationGenerator = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./src/generators/init/init"), exports);
var configuration_1 = require("./src/generators/configuration/configuration");
Object.defineProperty(exports, "configurationGenerator", { enumerable: true, get: function () { return configuration_1.configurationGenerator; } });
