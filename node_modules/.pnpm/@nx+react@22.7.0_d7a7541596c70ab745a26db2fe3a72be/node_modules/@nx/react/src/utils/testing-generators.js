"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
exports.createLib = createLib;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const application_1 = tslib_1.__importDefault(require("../generators/application/application"));
async function createApp(tree, appName) {
    await (0, application_1.default)(tree, {
        e2eTestRunner: 'none',
        linter: 'eslint',
        skipFormat: true,
        style: 'css',
        unitTestRunner: 'none',
        directory: appName,
    });
}
async function createLib(tree, libName) {
    const { fileName } = (0, devkit_1.names)(libName);
    tree.write(`/${fileName}/src/index.ts`, `import React from 'react';\n`);
    (0, devkit_1.addProjectConfiguration)(tree, fileName, {
        tags: [],
        root: `${fileName}`,
        projectType: 'library',
        sourceRoot: `${fileName}/src`,
        targets: {},
    });
}
