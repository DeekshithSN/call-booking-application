"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPackageJsonExportsForRemote = setupPackageJsonExportsForRemote;
const devkit_1 = require("@nx/devkit");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const maybe_js_1 = require("../../../utils/maybe-js");
function setupPackageJsonExportsForRemote(tree, options) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.projectName);
    const packageJsonPath = (0, devkit_1.joinPathFragments)(project.root, 'package.json');
    if (!tree.exists(packageJsonPath)) {
        throw new Error(`package.json not found at ${packageJsonPath}. ` +
            `TypeScript solution setup requires package.json for all projects.`);
    }
    const exportPath = (0, maybe_js_1.maybeJs)(options, './src/remote-entry.ts');
    const customCondition = (0, ts_solution_setup_1.getDefinedCustomConditionName)(tree);
    (0, devkit_1.updateJson)(tree, packageJsonPath, (json) => {
        json.exports = {
            ...json.exports,
            './Module': {
                [customCondition]: exportPath,
                types: exportPath,
                import: exportPath,
                default: exportPath,
            },
        };
        // Set types for IDE support (no main needed - this is an app, not a library)
        json.types = exportPath;
        return json;
    });
}
