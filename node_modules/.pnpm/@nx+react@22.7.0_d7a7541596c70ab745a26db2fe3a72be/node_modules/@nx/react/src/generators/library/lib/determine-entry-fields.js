"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineEntryFields = determineEntryFields;
function determineEntryFields(options) {
    if (options.bundler !== 'none') {
        return {};
    }
    return {
        main: options.js ? './src/index.js' : './src/index.ts',
        types: options.js ? './src/index.js' : './src/index.ts',
        exports: {
            '.': options.js
                ? './src/index.js'
                : {
                    types: './src/index.ts',
                    import: './src/index.ts',
                    default: './src/index.ts',
                },
            './package.json': './package.json',
        },
    };
}
