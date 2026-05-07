"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withModuleFederationForSSR = exports.withModuleFederation = void 0;
const webpack_1 = require("@nx/module-federation/webpack");
Object.defineProperty(exports, "withModuleFederation", { enumerable: true, get: function () { return webpack_1.withModuleFederation; } });
const webpack_2 = require("@nx/module-federation/webpack");
Object.defineProperty(exports, "withModuleFederationForSSR", { enumerable: true, get: function () { return webpack_2.withModuleFederationForSSR; } });
// Support for older generated code: `const withModuleFederation = require('@nx/react/module-federation')`
/**
 * @deprecated Use `@nx/module-federation/webpack` instead. This will be removed in Nx v22.
 */
module.exports = webpack_1.withModuleFederation;
// Allow newer generated code to work: `const { withModuleFederation } = require(...)`;
/**
 * @deprecated Use `@nx/module-federation/webpack` instead. This will be removed in Nx v22.
 */
module.exports.withModuleFederation = webpack_1.withModuleFederation;
/**
 * @deprecated Use `@nx/module-federation/webpack` instead. This will be removed in Nx v22.
 */
module.exports.withModuleFederationForSSR = webpack_2.withModuleFederationForSSR;
