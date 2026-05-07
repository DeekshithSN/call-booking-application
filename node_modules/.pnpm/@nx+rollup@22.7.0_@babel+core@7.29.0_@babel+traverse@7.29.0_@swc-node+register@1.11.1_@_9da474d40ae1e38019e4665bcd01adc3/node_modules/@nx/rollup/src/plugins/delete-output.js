"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOutput = deleteOutput;
const fs_1 = require("../utils/fs");
function deleteOutput(options) {
    return {
        name: 'rollup-plugin-nx-delete-output',
        buildStart: () => options.dirs.forEach((dir) => (0, fs_1.deleteOutputDir)(process.cwd(), dir)),
    };
}
