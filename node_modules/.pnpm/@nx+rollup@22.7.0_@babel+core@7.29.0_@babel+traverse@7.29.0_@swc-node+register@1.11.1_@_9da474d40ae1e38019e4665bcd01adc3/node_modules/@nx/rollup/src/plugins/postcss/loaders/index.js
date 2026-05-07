"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loaders = exports.createStylusLoader = exports.createSassLoader = exports.createLessLoader = exports.createPostCSSLoader = void 0;
const tslib_1 = require("tslib");
const postcss_loader_1 = require("./postcss-loader");
const less_loader_1 = require("./less-loader");
const sass_loader_1 = require("./sass-loader");
const stylus_loader_1 = require("./stylus-loader");
tslib_1.__exportStar(require("./types"), exports);
var postcss_loader_2 = require("./postcss-loader");
Object.defineProperty(exports, "createPostCSSLoader", { enumerable: true, get: function () { return postcss_loader_2.createPostCSSLoader; } });
var less_loader_2 = require("./less-loader");
Object.defineProperty(exports, "createLessLoader", { enumerable: true, get: function () { return less_loader_2.createLessLoader; } });
var sass_loader_2 = require("./sass-loader");
Object.defineProperty(exports, "createSassLoader", { enumerable: true, get: function () { return sass_loader_2.createSassLoader; } });
var stylus_loader_2 = require("./stylus-loader");
Object.defineProperty(exports, "createStylusLoader", { enumerable: true, get: function () { return stylus_loader_2.createStylusLoader; } });
/**
 * Manages the chain of CSS loaders (preprocessors + PostCSS)
 */
class Loaders {
    constructor(options) {
        this.loaders = [];
        // Register preprocessor loaders based on 'use' options
        // These are registered first and process files before PostCSS
        this.registerPreprocessors(options.use);
        // Register the PostCSS loader last - it always processes
        this.loaders.push((0, postcss_loader_1.createPostCSSLoader)(options.postcss));
    }
    /**
     * Register preprocessor loaders based on the 'use' option
     */
    registerPreprocessors(use) {
        // Less loader
        if (use.less !== false) {
            const lessOptions = typeof use.less === 'object' ? use.less : {};
            this.loaders.push((0, less_loader_1.createLessLoader)(lessOptions));
        }
        // Sass loader
        if (use.sass !== false) {
            const sassOptions = typeof use.sass === 'object' ? use.sass : {};
            this.loaders.push((0, sass_loader_1.createSassLoader)(sassOptions));
        }
        // Stylus loader
        if (use.stylus !== false) {
            const stylusOptions = typeof use.stylus === 'object' ? use.stylus : {};
            this.loaders.push((0, stylus_loader_1.createStylusLoader)(stylusOptions));
        }
    }
    /**
     * Check if any loader can process the given file
     */
    isSupported(filepath) {
        return this.loaders.some((loader) => this.matchesLoader(loader, filepath));
    }
    /**
     * Check if a file matches a loader's test
     */
    matchesLoader(loader, filepath) {
        if (typeof loader.test === 'function') {
            return loader.test(filepath);
        }
        return loader.test.test(filepath);
    }
    /**
     * Process a file through the loader chain
     * Preprocessors run first (if matching), then PostCSS always runs
     */
    async process(code, context) {
        let result = { code };
        // Process through each loader in order
        for (const loader of this.loaders) {
            // Skip non-matching loaders unless they always process
            if (!loader.alwaysProcess && !this.matchesLoader(loader, context.id)) {
                continue;
            }
            // Process with this loader
            const loaderResult = await loader.process(result.code, context);
            // Merge the result
            result = {
                ...result,
                ...loaderResult,
                // Preserve the map from the latest loader that produced one
                map: loaderResult.map ?? result.map,
            };
        }
        return result;
    }
}
exports.Loaders = Loaders;
