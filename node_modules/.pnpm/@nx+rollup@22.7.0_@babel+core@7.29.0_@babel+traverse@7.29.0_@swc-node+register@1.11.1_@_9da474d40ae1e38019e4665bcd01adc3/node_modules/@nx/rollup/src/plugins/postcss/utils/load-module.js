"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadModule = loadModule;
exports.requireModule = requireModule;
const path_1 = require("path");
/**
 * Load a module with fallback to loading from cwd
 * This allows preprocessors like sass, less, stylus to be loaded from
 * either the plugin's node_modules or the project's node_modules
 */
function loadModule(moduleId) {
    try {
        // First try to load from the plugin's node_modules
        return require(moduleId);
    }
    catch {
        // If that fails, try to load from the current working directory
        try {
            const modulePath = (0, path_1.resolve)(process.cwd(), 'node_modules', moduleId);
            return require(modulePath);
        }
        catch {
            return undefined;
        }
    }
}
/**
 * Load a module and throw an error if it's not found
 */
function requireModule(moduleId, feature) {
    const module = loadModule(moduleId);
    if (!module) {
        throw new Error(`You need to install "${moduleId}" package in order to process ${feature} files.`);
    }
    return module;
}
