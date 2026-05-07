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
exports.vitestGenerator = vitestGenerator;
const devkit_1 = require("@nx/devkit");
const devkit_2 = require("@nx/devkit");
const versions_1 = require("../../utils/versions");
/**
 * @deprecated Use `@nx/vitest:configuration` instead. This generator will be removed in Nx 23.
 */
async function vitestGenerator(tree, schema, hasPlugin = false, suppressDeprecationWarning = false) {
    if (!suppressDeprecationWarning) {
        devkit_1.logger.warn(`The '@nx/vite:vitest' generator is deprecated. Please use '@nx/vitest:configuration' instead. This generator will be removed in Nx 23.`);
    }
    (0, devkit_2.ensurePackage)('@nx/vitest', versions_1.nxVersion);
    const { configurationGenerator } = await Promise.resolve().then(() => __importStar(require('@nx/vitest/generators')));
    return await configurationGenerator(tree, schema, hasPlugin);
}
exports.default = vitestGenerator;
