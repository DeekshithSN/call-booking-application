/**
 * Load a module with fallback to loading from cwd
 * This allows preprocessors like sass, less, stylus to be loaded from
 * either the plugin's node_modules or the project's node_modules
 */
export declare function loadModule<T = unknown>(moduleId: string): T | undefined;
/**
 * Load a module and throw an error if it's not found
 */
export declare function requireModule<T = unknown>(moduleId: string, feature: string): T;
//# sourceMappingURL=load-module.d.ts.map