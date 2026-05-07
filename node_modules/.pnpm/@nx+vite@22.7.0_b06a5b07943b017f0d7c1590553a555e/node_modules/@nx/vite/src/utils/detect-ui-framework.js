"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectUiFramework = detectUiFramework;
const devkit_1 = require("@nx/devkit");
const ANGULAR_NPM_SCOPE = 'angular';
const ANGULAR_DEPS = ['@nx/angular'];
const REACT_DEPS = ['react', '@nx/react'];
async function detectUiFramework(project) {
    const graph = await (0, devkit_1.createProjectGraphAsync)();
    for (const dep of graph.dependencies[project] ?? []) {
        if (dep.source !== project || !dep.target.startsWith('npm:')) {
            continue;
        }
        const npmDependency = dep.target.replace('npm:', '');
        if (dep.target.startsWith(`npm:@${ANGULAR_NPM_SCOPE}/`) ||
            ANGULAR_DEPS.includes(npmDependency)) {
            return 'angular';
        }
        if (REACT_DEPS.includes(npmDependency)) {
            return 'react';
        }
    }
    return 'none';
}
