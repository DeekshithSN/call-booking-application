"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRspackPlugin = hasRspackPlugin;
const devkit_1 = require("@nx/devkit");
function hasRspackPlugin(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    return !!nxJson.plugins?.some((p) => typeof p === 'string'
        ? p === '@nx/rspack/plugin'
        : p.plugin === '@nx/rspack/plugin');
}
