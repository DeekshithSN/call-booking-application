"use strict";
/**
 * @nx/rollup PostCSS plugin
 *
 * An inlined, simplified version of rollup-plugin-postcss that:
 * - Processes CSS files through PostCSS
 * - Supports CSS preprocessors (Sass, Less, Stylus)
 * - Supports CSS Modules
 * - Can inject CSS into DOM or extract to separate files
 *
 * This replaces the external rollup-plugin-postcss dependency to avoid
 * peer dependency conflicts and maintenance issues.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.postcss = void 0;
var postcss_plugin_1 = require("./postcss-plugin");
Object.defineProperty(exports, "postcss", { enumerable: true, get: function () { return postcss_plugin_1.postcss; } });
var postcss_plugin_2 = require("./postcss-plugin");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return postcss_plugin_2.postcss; } });
