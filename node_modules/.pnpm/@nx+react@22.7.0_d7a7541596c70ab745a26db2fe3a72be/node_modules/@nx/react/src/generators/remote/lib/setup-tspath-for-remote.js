"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTspathForRemote = setupTspathForRemote;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const maybe_js_1 = require("../../../utils/maybe-js");
const module_federation_1 = require("@nx/module-federation");
function setupTspathForRemote(tree, options) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.projectName);
    const exportPath = (0, maybe_js_1.maybeJs)(options, './src/remote-entry.ts');
    const exportName = 'Module';
    (0, js_1.addTsConfigPath)(tree, `${(0, module_federation_1.normalizeProjectName)(options.projectName)}/${exportName}`, [(0, devkit_1.joinPathFragments)(project.root, exportPath)]);
}
