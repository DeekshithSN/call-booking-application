"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
async function default_1(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const executor = '@nx/eslint:lint';
    if (!nxJson.targetDefaults?.[executor]?.inputs) {
        return;
    }
    const inputs = nxJson.targetDefaults[executor].inputs;
    if (!inputs.includes('^default')) {
        // Add after 'default' if present, otherwise at the beginning
        const defaultIndex = inputs.indexOf('default');
        if (defaultIndex !== -1) {
            inputs.splice(defaultIndex + 1, 0, '^default');
        }
        else {
            inputs.unshift('^default');
        }
    }
    if (!inputs.includes('{workspaceRoot}/tools/eslint-rules/**/*')) {
        inputs.push('{workspaceRoot}/tools/eslint-rules/**/*');
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
    await (0, devkit_1.formatFiles)(tree);
}
