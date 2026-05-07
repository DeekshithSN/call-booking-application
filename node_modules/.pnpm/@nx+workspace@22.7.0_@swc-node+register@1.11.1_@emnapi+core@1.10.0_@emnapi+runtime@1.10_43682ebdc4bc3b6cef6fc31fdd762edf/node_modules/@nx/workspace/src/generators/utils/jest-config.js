"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRootJestConfig = findRootJestConfig;
exports.findProjectJestConfig = findProjectJestConfig;
const devkit_1 = require("@nx/devkit");
function findRootJestConfig(tree) {
    if (tree.exists('jest.config.js')) {
        return 'jest.config.js';
    }
    if (tree.exists('jest.config.ts')) {
        return 'jest.config.ts';
    }
    if (tree.exists('jest.config.cts')) {
        return 'jest.config.cts';
    }
    return null;
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
