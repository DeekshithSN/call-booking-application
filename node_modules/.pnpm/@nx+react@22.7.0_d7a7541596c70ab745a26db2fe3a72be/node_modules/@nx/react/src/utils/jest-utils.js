"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJestConfigContent = updateJestConfigContent;
exports.findProjectJestConfig = findProjectJestConfig;
const devkit_1 = require("@nx/devkit");
function updateJestConfigContent(content) {
    return content
        .replace('transform: {', "transform: {\n    '^(?!.*\\\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',")
        .replace(`'babel-jest'`, `['babel-jest', { presets: ['@nx/react/babel'] }]`);
}
function findProjectJestConfig(tree, projectRoot) {
    const extensions = ['js', 'ts', 'cts'];
    for (const ext of extensions) {
        const configPath = (0, devkit_1.joinPathFragments)(projectRoot, `jest.config.${ext}`);
        if (tree.exists(configPath)) {
            return configPath;
        }
    }
    return null;
}
