"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLessLoader = createLessLoader;
const util_1 = require("util");
const utils_1 = require("../utils");
let less;
/**
 * Less preprocessor loader
 * Compiles .less files to CSS
 */
function createLessLoader(options = {}) {
    return {
        name: 'less',
        test: /\.less$/,
        async process(code, context) {
            if (!less) {
                less = (0, utils_1.requireModule)('less', 'Less');
            }
            const render = (0, util_1.promisify)(less.render.bind(less));
            const result = await render(code, {
                ...options,
                filename: context.id,
                sourceMap: context.sourceMap
                    ? {
                        outputSourceFiles: true,
                    }
                    : undefined,
            });
            // Track dependencies
            if (result.imports) {
                for (const dep of result.imports) {
                    context.dependencies.add(dep);
                }
            }
            let map;
            if (result.map) {
                map = JSON.parse(result.map);
                if (map && map.sources) {
                    map.sources = map.sources.map(utils_1.humanizePath);
                }
            }
            return {
                code: result.css,
                map,
            };
        },
    };
}
