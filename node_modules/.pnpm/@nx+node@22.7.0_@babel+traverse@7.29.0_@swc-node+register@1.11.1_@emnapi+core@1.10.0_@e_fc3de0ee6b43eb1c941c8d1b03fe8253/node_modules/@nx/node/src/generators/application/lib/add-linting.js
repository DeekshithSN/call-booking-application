"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLintingToApplication = addLintingToApplication;
const devkit_1 = require("@nx/devkit");
const eslint_1 = require("@nx/eslint");
async function addLintingToApplication(tree, options) {
    const lintTask = await (0, eslint_1.lintProjectGenerator)(tree, {
        linter: options.linter,
        project: options.name,
        tsConfigPaths: [
            (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.app.json'),
        ],
        unitTestRunner: options.unitTestRunner,
        skipFormat: true,
        setParserOptionsProject: options.setParserOptionsProject,
        rootProject: options.rootProject,
        addPlugin: options.addPlugin,
    });
    return lintTask;
}
