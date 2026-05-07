"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findViteConfig = findViteConfig;
exports.findWebpackConfig = findWebpackConfig;
const devkit_1 = require("@nx/devkit");
function findViteConfig(tree, searchRoot) {
    const allowsExt = ['js', 'mjs', 'ts', 'cjs', 'mts', 'cts'];
    for (const ext of allowsExt) {
        if (tree.exists((0, devkit_1.joinPathFragments)(searchRoot, `vite.config.${ext}`))) {
            return (0, devkit_1.joinPathFragments)(searchRoot, `vite.config.${ext}`);
        }
    }
}
function findWebpackConfig(tree, searchRoot) {
    const allowsExt = ['js', 'ts', 'mjs', 'cjs'];
    for (const ext of allowsExt) {
        if (tree.exists((0, devkit_1.joinPathFragments)(searchRoot, `webpack.config.${ext}`))) {
            return (0, devkit_1.joinPathFragments)(searchRoot, `webpack.config.${ext}`);
        }
    }
}
