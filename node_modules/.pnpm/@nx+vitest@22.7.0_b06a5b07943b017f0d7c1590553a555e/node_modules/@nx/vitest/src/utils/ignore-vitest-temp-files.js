"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ignoreVitestTempFiles = ignoreVitestTempFiles;
exports.addVitestTempFilesToGitIgnore = addVitestTempFilesToGitIgnore;
exports.isEslintInstalled = isEslintInstalled;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("./versions");
async function ignoreVitestTempFiles(tree, projectRoot) {
    addVitestTempFilesToGitIgnore(tree);
    await ignoreVitestTempFilesInEslintConfig(tree, projectRoot);
}
function addVitestTempFilesToGitIgnore(tree) {
    let gitIgnoreContents = tree.exists('.gitignore')
        ? tree.read('.gitignore', 'utf-8')
        : '';
    if (!/^vitest\.config\.\*\.timestamp\*$/m.test(gitIgnoreContents)) {
        gitIgnoreContents = (0, devkit_1.stripIndents) `${gitIgnoreContents}
      vitest.config.*.timestamp*`;
    }
    tree.write('.gitignore', gitIgnoreContents);
}
async function ignoreVitestTempFilesInEslintConfig(tree, projectRoot) {
    if (!isEslintInstalled(tree)) {
        return;
    }
    (0, devkit_1.ensurePackage)('@nx/eslint', versions_1.nxVersion);
    const { addIgnoresToLintConfig, isEslintConfigSupported } = await Promise.resolve().then(() => __importStar(require('@nx/eslint/src/generators/utils/eslint-file')));
    if (!isEslintConfigSupported(tree)) {
        return;
    }
    const { useFlatConfig } = await Promise.resolve().then(() => __importStar(require('@nx/eslint/src/utils/flat-config')));
    const isUsingFlatConfig = useFlatConfig(tree);
    if (!projectRoot && !isUsingFlatConfig) {
        // root eslintrc files ignore all files and the root eslintrc files add
        // back all the project files, so we only add the ignores to the project
        // eslintrc files
        return;
    }
    // for flat config, we update the root config file
    const directory = isUsingFlatConfig ? '' : (projectRoot ?? '');
    addIgnoresToLintConfig(tree, directory, ['**/vitest.config.*.timestamp*']);
}
function isEslintInstalled(tree) {
    try {
        require('eslint');
        return true;
    }
    catch { }
    // it might not be installed yet, but it might be in the tree pending install
    const { devDependencies, dependencies } = tree.exists('package.json')
        ? (0, devkit_1.readJson)(tree, 'package.json')
        : {};
    return !!devDependencies?.['eslint'] || !!dependencies?.['eslint'];
}
