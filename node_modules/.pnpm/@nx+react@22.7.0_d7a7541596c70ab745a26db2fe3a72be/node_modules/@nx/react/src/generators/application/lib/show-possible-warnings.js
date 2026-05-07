"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showPossibleWarnings = showPossibleWarnings;
const tslib_1 = require("tslib");
const pc = tslib_1.__importStar(require("picocolors"));
const devkit_1 = require("@nx/devkit");
function showPossibleWarnings(tree, options) {
    if (options.style === 'styled-jsx' && options.compiler === 'swc') {
        devkit_1.logger.warn(`styled-jsx may not work with SWC. Try using ${pc.bold('nx g @nx/react:app --compiler=babel')} instead.`);
    }
}
