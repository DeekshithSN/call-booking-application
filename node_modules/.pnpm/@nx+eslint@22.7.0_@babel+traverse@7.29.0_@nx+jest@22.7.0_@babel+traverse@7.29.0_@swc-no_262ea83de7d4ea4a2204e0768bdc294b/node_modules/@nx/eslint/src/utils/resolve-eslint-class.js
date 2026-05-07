"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveESLintClass = resolveESLintClass;
const flat_config_1 = require("../utils/flat-config");
async function resolveESLintClass(opts) {
    try {
        const shouldESLintUseFlatConfig = typeof opts?.useFlatConfigOverrideVal === 'boolean'
            ? opts.useFlatConfigOverrideVal
            : (0, flat_config_1.useFlatConfig)();
        // In eslint 8.57.0 (the final v8 version), a dedicated API was added for resolving the correct ESLint class.
        const eslintModule = (await Promise.resolve().then(() => __importStar(require('eslint'))));
        if (typeof eslintModule.loadESLint === 'function') {
            return (await eslintModule.loadESLint({
                useFlatConfig: shouldESLintUseFlatConfig,
            }));
        }
        // Explicitly use the FlatESLint and LegacyESLint classes here because the ESLint class points at a different one based on ESLint v8 vs ESLint v9
        // But the decision on which one to use is not just based on the major version of ESLint.
        const { LegacyESLint, FlatESLint } = await Promise.resolve().then(() => __importStar(require('eslint/use-at-your-own-risk')));
        // LegacyESLint's type no longer structurally matches the flat ESLint class
        // in v9 type defs (new static members like defaultConfig, fromOptionsModule),
        // but at runtime either class is an appropriate return value here.
        return (shouldESLintUseFlatConfig ? FlatESLint : LegacyESLint);
    }
    catch {
        throw new Error('Unable to find `eslint`. Ensure a valid `eslint` version is installed.');
    }
}
