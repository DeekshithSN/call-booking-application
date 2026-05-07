"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUiFramework = getUiFramework;
const devkit_1 = require("@nx/devkit");
function getUiFramework(tree, project) {
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, project);
    if (findWebpackConfig(tree, projectConfig.root) ||
        projectConfig.targets?.['build']?.executor === '@nx/rollup:rollup' ||
        projectConfig.targets?.['build']?.executor === '@nx/expo:build') {
        return '@storybook/react-webpack5';
    }
    return '@storybook/react-vite';
}
function findWebpackConfig(tree, projectRoot) {
    const allowsExt = ['js', 'mjs', 'ts', 'cjs', 'mts', 'cts'];
    for (const ext of allowsExt) {
        const webpackConfigPath = (0, devkit_1.joinPathFragments)(projectRoot, `webpack.config.${ext}`);
        if (tree.exists(webpackConfigPath)) {
            return webpackConfigPath;
        }
    }
}
