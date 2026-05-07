"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVsCodeRecommendedExtensions = updateVsCodeRecommendedExtensions;
const devkit_1 = require("@nx/devkit");
function updateVsCodeRecommendedExtensions(host) {
    if (!host.exists('.vscode/extensions.json')) {
        return;
    }
    (0, devkit_1.updateJson)(host, '.vscode/extensions.json', (json) => {
        json.recommendations = json.recommendations || [];
        const extension = 'firsttris.vscode-jest-runner';
        if (!json.recommendations.includes(extension)) {
            json.recommendations.push(extension);
        }
        return json;
    });
}
