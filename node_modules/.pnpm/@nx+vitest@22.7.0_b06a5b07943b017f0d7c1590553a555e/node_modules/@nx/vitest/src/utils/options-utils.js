"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeViteConfigFilePath = normalizeViteConfigFilePath;
exports.getProjectTsConfigPath = getProjectTsConfigPath;
exports.getNxTargetOptions = getNxTargetOptions;
const devkit_1 = require("@nx/devkit");
const fs_1 = require("fs");
/**
 * Returns the path to the vite config file or undefined when not found.
 */
function normalizeViteConfigFilePath(contextRoot, projectRoot, configFile) {
    if (configFile) {
        const normalized = (0, devkit_1.joinPathFragments)(contextRoot, configFile);
        if (!(0, fs_1.existsSync)(normalized)) {
            throw new Error(`Could not find vite config at provided path "${normalized}".`);
        }
        return normalized;
    }
    const allowsExt = ['js', 'mjs', 'ts', 'cjs', 'mts', 'cts'];
    for (const ext of allowsExt) {
        if ((0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(contextRoot, projectRoot, `vite.config.${ext}`))) {
            return (0, devkit_1.joinPathFragments)(contextRoot, projectRoot, `vite.config.${ext}`);
        }
        else if ((0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(contextRoot, projectRoot, `vitest.config.${ext}`))) {
            return (0, devkit_1.joinPathFragments)(contextRoot, projectRoot, `vitest.config.${ext}`);
        }
    }
}
function getProjectTsConfigPath(projectRoot) {
    return (0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot, 'tsconfig.app.json'))
        ? (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.app.json')
        : (0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot, 'tsconfig.lib.json'))
            ? (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.lib.json')
            : (0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot, 'tsconfig.json'))
                ? (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.json')
                : undefined;
}
function getNxTargetOptions(target, context) {
    const targetObj = (0, devkit_1.parseTargetString)(target, context);
    return (0, devkit_1.readTargetOptions)(targetObj, context);
}
