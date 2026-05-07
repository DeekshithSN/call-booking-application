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
exports.configureCypressCT = configureCypressCT;
exports.getBundlerFromTarget = getBundlerFromTarget;
exports.getActualBundler = getActualBundler;
exports.isComponent = isComponent;
const devkit_1 = require("@nx/devkit");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const ast_utils_1 = require("./ast-utils");
let tsModule;
const allowedFileExt = new RegExp(/\.[jt]sx?/);
const isSpecFile = new RegExp(/(spec|test)\./);
async function configureCypressCT(tree, options) {
    let found = { target: options.buildTarget, config: undefined };
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    // Specifically undefined as a workaround for Remix to pass an empty string as the buildTarget
    if (options.buildTarget === undefined) {
        const { findBuildConfig } = await Promise.resolve().then(() => __importStar(require('@nx/cypress/src/utils/find-target-options')));
        found = await findBuildConfig(tree, {
            project: options.project,
            buildTarget: options.buildTarget,
            validExecutorNames: options.validExecutorNames,
        });
        assertValidConfig(found?.config);
    }
    else if (options.buildTarget) {
        const projectGraph = await (0, devkit_1.createProjectGraphAsync)();
        const { project, target } = (0, devkit_1.parseTargetString)(options.buildTarget, projectGraph);
        const buildTargetProject = (0, devkit_1.readProjectConfiguration)(tree, project);
        const executor = buildTargetProject.targets?.[target]?.executor;
        if (!executor || !options.validExecutorNames.has(executor)) {
            throw new Error(`Cypress Component Testing is not currently supported for this project. Either 'executer' is not defined in '${target} target' of '${project} project.json' or executer present is not valid one. Valid ones are ${JSON.stringify([...options.validExecutorNames])}. Please check https://github.com/nrwl/nx/issues/21546 for more information.`);
        }
    }
    const { addDefaultCTConfig, getProjectCypressConfigPath } = await Promise.resolve().then(() => __importStar(require('@nx/cypress/src/utils/config')));
    const ctConfigOptions = {
        bundler: options.bundler ?? (await getActualBundler(tree, options, found)),
    };
    if (projectConfig.targets?.['component-test']?.executor ===
        '@nx/cypress:cypress') {
        projectConfig.targets['component-test'].options = {
            ...projectConfig.targets['component-test'].options,
            devServerTarget: found.target,
            skipServe: true,
        };
        (0, devkit_1.updateProjectConfiguration)(tree, options.project, projectConfig);
    }
    else {
        ctConfigOptions.buildTarget = found.target;
    }
    const cypressConfigFilePath = getProjectCypressConfigPath(tree, projectConfig.root);
    const updatedCyConfig = await addDefaultCTConfig(tree.read(cypressConfigFilePath, 'utf-8'), ctConfigOptions);
    tree.write(cypressConfigFilePath, `import { nxComponentTestingPreset } from '@nx/react/plugins/component-testing';\n${updatedCyConfig}`);
    return found;
}
function assertValidConfig(config) {
    if (!config) {
        throw new Error('Unable to find a valid build configuration. Try passing in a target for an app. --build-target=<project>:<target>[:<configuration>]');
    }
}
async function getBundlerFromTarget(found, tree) {
    if (found.target && found.config?.executor) {
        return found.config.executor === '@nx/vite:build' ? 'vite' : 'webpack';
    }
    const { target, project } = (0, devkit_1.parseTargetString)(found.target, await (0, devkit_1.createProjectGraphAsync)());
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, project);
    const executor = projectConfig?.targets?.[target]?.executor;
    return executor === '@nx/vite:build' ? 'vite' : 'webpack';
}
async function getActualBundler(tree, options, found) {
    // Specifically undefined to allow Remix workaround of passing an empty string
    const actualBundler = options.buildTarget !== undefined && options.bundler
        ? options.bundler
        : await getBundlerFromTarget(found, tree);
    return actualBundler;
}
function isComponent(tree, filePath) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    if (isSpecFile.test(filePath) || !allowedFileExt.test(filePath)) {
        return false;
    }
    const content = tree.read(filePath, 'utf-8');
    const sourceFile = tsModule.createSourceFile(filePath, content, tsModule.ScriptTarget.Latest, true);
    const cmpDeclaration = (0, ast_utils_1.getComponentNode)(sourceFile);
    return !!cmpDeclaration;
}
