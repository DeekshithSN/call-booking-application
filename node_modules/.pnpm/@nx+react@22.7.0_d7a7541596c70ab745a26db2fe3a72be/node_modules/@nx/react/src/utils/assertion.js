"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidStyle = assertValidStyle;
exports.assertValidReactRouter = assertValidReactRouter;
const VALID_STYLES = [
    'css',
    'scss',
    'less',
    'tailwind',
    'styled-components',
    '@emotion/styled',
    'styled-jsx',
    'none',
];
function assertValidStyle(style) {
    if (VALID_STYLES.indexOf(style) === -1) {
        throw new Error(`Unsupported style option found: ${style}. Valid values are: "${VALID_STYLES.join('", "')}"`);
    }
}
function assertValidReactRouter(reactRouter, bundler) {
    if (reactRouter && bundler !== 'vite') {
        throw new Error(`Unsupported bundler found: ${bundler}. React Router is only supported with 'vite'.`);
    }
}
