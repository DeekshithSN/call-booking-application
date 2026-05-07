"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPlugin = hasPlugin;
const devkit_1 = require("@nx/devkit");
function hasPlugin(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    return !!nxJson.plugins?.some((p) => typeof p === 'string'
        ? p === '@nx/rollup/plugin'
        : p.plugin === '@nx/rollup/plugin');
}
