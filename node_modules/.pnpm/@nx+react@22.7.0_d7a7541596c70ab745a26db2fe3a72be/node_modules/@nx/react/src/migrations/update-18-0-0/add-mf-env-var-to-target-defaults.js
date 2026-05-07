"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const add_mf_env_to_inputs_1 = require("../../utils/add-mf-env-to-inputs");
async function default_1(tree) {
    const bundler = hasModuleFederationProject(tree);
    if (!bundler) {
        return;
    }
    (0, add_mf_env_to_inputs_1.addMfEnvToTargetDefaultInputs)(tree, bundler);
    await (0, devkit_1.formatFiles)(tree);
}
function hasModuleFederationProject(tree) {
    const projects = (0, devkit_1.getProjects)(tree);
    for (const project of projects.values()) {
        const targets = project.targets || {};
        for (const [_, target] of Object.entries(targets)) {
            if (tree.exists((0, devkit_1.joinPathFragments)(project.root, 'module-federation.config.ts')) ||
                tree.exists((0, devkit_1.joinPathFragments)(project.root, 'module-federation.config.js'))) {
                if (target.executor === '@nx/webpack:webpack') {
                    return 'webpack';
                }
                else if (target.executor === '@nx/rspack:rspack') {
                    return 'rspack';
                }
            }
        }
    }
    return false;
}
