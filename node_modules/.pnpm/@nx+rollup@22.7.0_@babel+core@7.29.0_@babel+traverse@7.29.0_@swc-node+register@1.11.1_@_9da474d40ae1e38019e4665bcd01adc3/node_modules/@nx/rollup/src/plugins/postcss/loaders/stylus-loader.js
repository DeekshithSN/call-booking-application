"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStylusLoader = createStylusLoader;
const path_1 = require("path");
const utils_1 = require("../utils");
let stylus;
/**
 * Stylus preprocessor loader
 * Compiles .styl and .stylus files to CSS
 */
function createStylusLoader(options = {}) {
    return {
        name: 'stylus',
        test: /\.(styl|stylus)$/,
        async process(code, context) {
            if (!stylus) {
                stylus = (0, utils_1.requireModule)('stylus', 'Stylus');
            }
            const renderer = stylus(code);
            // Set options
            renderer.set('filename', context.id);
            renderer.set('paths', [(0, path_1.dirname)(context.id), process.cwd()]);
            if (context.sourceMap) {
                renderer.set('sourcemap', {
                    comment: false,
                    inline: false,
                    basePath: process.cwd(),
                });
            }
            // Apply additional options
            for (const [key, value] of Object.entries(options)) {
                renderer.set(key, value);
            }
            return new Promise((resolve, reject) => {
                renderer.render((error, css) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    // Track dependencies
                    const deps = renderer.deps();
                    for (const dep of deps) {
                        context.dependencies.add(dep);
                    }
                    let map;
                    if (renderer.sourcemap) {
                        map = renderer.sourcemap;
                        if (map?.sources) {
                            map.sources = map.sources.map(utils_1.humanizePath);
                        }
                    }
                    resolve({
                        code: css,
                        map,
                    });
                });
            });
        },
    };
}
