"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSassLoader = createSassLoader;
const path_1 = require("path");
const utils_1 = require("../utils");
let sassModule;
let isModernSass = false;
/**
 * Get the sass module, trying modern sass first, then node-sass
 */
function getSassModule() {
    if (sassModule) {
        return sassModule;
    }
    // Try modern sass first
    const modernSass = (0, utils_1.loadModule)('sass');
    if (modernSass && typeof modernSass.compile === 'function') {
        sassModule = modernSass;
        isModernSass = true;
        return sassModule;
    }
    // Try legacy sass (or node-sass)
    const legacySass = (0, utils_1.loadModule)('sass') || (0, utils_1.loadModule)('node-sass');
    if (legacySass && typeof legacySass.render === 'function') {
        sassModule = legacySass;
        isModernSass = false;
        return sassModule;
    }
    throw new Error('You need to install "sass" or "node-sass" package in order to process Sass files.');
}
/**
 * Resolve a module import (handles ~ prefix for node_modules)
 */
function resolveModuleImport(url, prev) {
    if (!url.startsWith('~')) {
        return null;
    }
    const modulePath = url.slice(1);
    const prevDir = (0, path_1.dirname)(prev);
    // Try to resolve from node_modules
    const paths = [
        (0, path_1.join)(prevDir, 'node_modules', modulePath),
        (0, path_1.join)(process.cwd(), 'node_modules', modulePath),
    ];
    // Also try partial file (with underscore prefix)
    const dir = (0, path_1.dirname)(modulePath);
    const file = (0, path_1.basename)(modulePath);
    const partialPaths = [
        (0, path_1.join)(prevDir, 'node_modules', dir, `_${file}`),
        (0, path_1.join)(process.cwd(), 'node_modules', dir, `_${file}`),
    ];
    // Try all paths with various extensions
    const extensions = ['', '.scss', '.sass', '.css'];
    for (const basePath of [...partialPaths, ...paths]) {
        for (const ext of extensions) {
            const fullPath = basePath + ext;
            try {
                require.resolve(fullPath);
                return fullPath;
            }
            catch {
                // Continue trying
            }
        }
    }
    return null;
}
/**
 * Sass/SCSS preprocessor loader
 * Compiles .sass and .scss files to CSS
 */
function createSassLoader(options = {}) {
    return {
        name: 'sass',
        test: /\.(sass|scss)$/,
        async process(code, context) {
            const sass = getSassModule();
            const { implementation: _, ...sassOptions } = options;
            if (isModernSass) {
                // Modern sass (Dart Sass) with compile API
                const modernSass = sass;
                const result = modernSass.compileString(code, {
                    ...sassOptions,
                    loadPaths: [(0, path_1.dirname)(context.id), process.cwd(), 'node_modules'],
                    sourceMap: !!context.sourceMap,
                    importers: [
                        {
                            findFileUrl(url) {
                                const resolved = resolveModuleImport(url, context.id);
                                if (resolved) {
                                    return new URL(`file://${(0, path_1.resolve)(resolved)}`);
                                }
                                return null;
                            },
                        },
                    ],
                });
                // Track dependencies
                for (const loadedUrl of result.loadedUrls) {
                    if (loadedUrl.protocol === 'file:') {
                        context.dependencies.add(loadedUrl.pathname);
                    }
                }
                let map;
                if (result.sourceMap) {
                    map = result.sourceMap;
                    if (map?.sources) {
                        map.sources = map.sources.map(utils_1.humanizePath);
                    }
                }
                return {
                    code: result.css,
                    map,
                };
            }
            else {
                // Legacy sass/node-sass with render API
                const legacySass = sass;
                return new Promise((resolvePromise, reject) => {
                    legacySass.render({
                        ...sassOptions,
                        data: code,
                        file: context.id,
                        includePaths: [(0, path_1.dirname)(context.id), process.cwd()],
                        sourceMap: !!context.sourceMap,
                        outFile: context.id,
                        sourceMapContents: true,
                        importer: (url, prev, done) => {
                            const resolved = resolveModuleImport(url, prev);
                            if (resolved) {
                                done({ file: resolved });
                            }
                            else {
                                done(null);
                            }
                        },
                    }, (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        // Track dependencies
                        if (result.stats.includedFiles) {
                            for (const dep of result.stats.includedFiles) {
                                context.dependencies.add(dep);
                            }
                        }
                        let map;
                        if (result.map) {
                            map = JSON.parse(result.map.toString());
                            if (map?.sources) {
                                map.sources = map.sources.map(utils_1.humanizePath);
                            }
                        }
                        resolvePromise({
                            code: result.css.toString(),
                            map,
                        });
                    });
                });
            }
        },
    };
}
