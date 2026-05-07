"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jestPresetExtensions = exports.jestConfigExtensions = void 0;
exports.getPresetExt = getPresetExt;
exports.findRootJestConfig = findRootJestConfig;
exports.findJestConfig = findJestConfig;
exports.findRootJestPreset = findRootJestPreset;
const devkit_1 = require("@nx/devkit");
exports.jestConfigExtensions = [
    'js',
    'ts',
    'mjs',
    'cjs',
    'mts',
    'cts',
];
exports.jestPresetExtensions = ['js', 'cjs', 'mjs'];
function getPresetExt(tree) {
    const ext = exports.jestPresetExtensions.find((ext) => tree.exists(`jest.preset.${ext}`));
    if (ext) {
        return ext;
    }
    const rootPkgJson = (0, devkit_1.readJson)(tree, 'package.json');
    if (rootPkgJson.type && rootPkgJson.type === 'module') {
        // use cjs if package.json type is module
        return 'cjs';
    }
    // default to js
    return 'js';
}
function findRootJestConfig(tree) {
    const ext = exports.jestConfigExtensions.find((ext) => tree.exists(`jest.config.${ext}`));
    return ext ? `jest.config.${ext}` : null;
}
function findJestConfig(tree, projectPath) {
    const ext = exports.jestConfigExtensions.find((ext) => tree.exists(`${projectPath}/jest.config.${ext}`));
    return ext ? `${projectPath}/jest.config.${ext}` : null;
}
function findRootJestPreset(tree) {
    const ext = exports.jestPresetExtensions.find((ext) => tree.exists(`jest.preset.${ext}`));
    return ext ? `jest.preset.${ext}` : null;
}
