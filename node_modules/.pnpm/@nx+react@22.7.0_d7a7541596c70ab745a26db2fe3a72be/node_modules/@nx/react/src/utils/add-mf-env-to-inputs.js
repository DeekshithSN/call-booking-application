"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMfEnvToTargetDefaultInputs = addMfEnvToTargetDefaultInputs;
const devkit_1 = require("@nx/devkit");
function addMfEnvToTargetDefaultInputs(tree, bundler) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const executor = bundler === 'rspack' ? '@nx/rspack:rspack' : '@nx/webpack:webpack';
    const mfEnvVar = 'NX_MF_DEV_REMOTES';
    nxJson.targetDefaults ??= {};
    nxJson.targetDefaults[executor] ??= {};
    nxJson.targetDefaults[executor].inputs ??= ['production', '^production'];
    nxJson.targetDefaults[executor].dependsOn ??= ['^build'];
    let mfEnvVarExists = false;
    for (const input of nxJson.targetDefaults[executor].inputs) {
        if (typeof input === 'object' && input['env'] === mfEnvVar) {
            mfEnvVarExists = true;
            break;
        }
    }
    if (!mfEnvVarExists) {
        nxJson.targetDefaults[executor].inputs.push({ env: mfEnvVar });
    }
    nxJson.targetDefaults[executor].cache = true;
    (0, devkit_1.updateNxJson)(tree, nxJson);
}
