"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
/**
 * Normalize plugin options with defaults
 */
function normalizeOptions(options = {}) {
    return {
        ...options,
        inject: options.inject ?? true,
        extract: options.extract ?? false,
        autoModules: options.autoModules ?? false,
        modules: options.modules ?? false,
        plugins: options.plugins ?? [],
        use: options.use ?? {},
        extensions: options.extensions ?? ['.css', '.sss', '.pcss'],
        sourceMap: options.sourceMap ?? false,
    };
}
