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
exports.addFiles = addFiles;
const devkit_1 = require("@nx/devkit");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const versions_1 = require("nx/src/utils/versions");
const ct_utils_1 = require("../../../utils/ct-utils");
const component_test_1 = require("../../component-test/component-test");
async function addFiles(tree, projectConfig, options, found) {
    // must dynamicaly import to prevent packages not using cypress from erroring out
    // when importing react
    const { addMountDefinition } = await Promise.resolve().then(() => __importStar(require('@nx/cypress/src/utils/config')));
    const { getInstalledCypressMajorVersion } = await Promise.resolve().then(() => __importStar(require('@nx/cypress/src/utils/versions')));
    const installedCypressMajorVersion = getInstalledCypressMajorVersion(tree);
    // Specifically undefined to allow Remix workaround of passing an empty string
    const actualBundler = await (0, ct_utils_1.getActualBundler)(tree, options, found);
    if (options.bundler && options.bundler !== actualBundler) {
        devkit_1.logger.warn(`You have specified ${options.bundler} as the bundler but this project is configured to use ${actualBundler}.
      This may cause errors. If you are seeing errors, try removing the --bundler option.`);
    }
    const bundlerToUse = options.bundler ?? actualBundler;
    const commandFile = (0, devkit_1.joinPathFragments)(projectConfig.root, 'cypress', 'support', 'component.ts');
    const updatedCommandFile = await addMountDefinition(tree.read(commandFile, 'utf-8'));
    const moduleSpecifier = installedCypressMajorVersion >= 14 ? 'cypress/react' : 'cypress/react18';
    tree.write(commandFile, `import { mount } from '${moduleSpecifier}';\n${updatedCommandFile}`);
    if (options.bundler === 'webpack' ||
        (!options.bundler && actualBundler === 'webpack')) {
        (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { '@nx/webpack': versions_1.nxVersion });
    }
    if (options.bundler === 'vite' ||
        (!options.bundler && actualBundler === 'vite')) {
        (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { '@nx/vite': versions_1.nxVersion });
    }
    if (options.generateTests) {
        const filePaths = [];
        const sourceRoot = (0, ts_solution_setup_1.getProjectSourceRoot)(projectConfig, tree);
        (0, devkit_1.visitNotIgnoredFiles)(tree, sourceRoot, (filePath) => {
            if ((0, ct_utils_1.isComponent)(tree, filePath)) {
                filePaths.push(filePath);
            }
        });
        for (const filePath of filePaths) {
            await (0, component_test_1.componentTestGenerator)(tree, {
                project: options.project,
                componentPath: filePath,
            });
        }
    }
}
