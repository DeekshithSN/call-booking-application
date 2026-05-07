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
exports.setupViteConfiguration = setupViteConfiguration;
exports.setupVitestConfiguration = setupVitestConfiguration;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../../../utils/versions");
const version_utils_1 = require("../../../../utils/version-utils");
async function setupViteConfiguration(tree, options, tasks) {
    const { createOrEditViteConfig, viteConfigurationGenerator } = (0, devkit_1.ensurePackage)('@nx/vite', versions_1.nxVersion);
    // We recommend users use `import.meta.env.MODE` and other variables in their code to differentiate between production and development.
    // See: https://vite.dev/guide/env-and-mode.html
    if (tree.exists((0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/environments'))) {
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/environments'));
    }
    const reactRouterFrameworkConfig = {
        imports: [`import { reactRouter } from '@react-router/dev/vite'`],
        plugins: ['!process.env.VITEST && reactRouter()'],
    };
    const baseReactConfig = {
        imports: [
            options.compiler === 'swc'
                ? `import react from '@vitejs/plugin-react-swc'`
                : `import react from '@vitejs/plugin-react'`,
        ],
        plugins: ['react()'],
    };
    // @react-router/dev < 7.14.0 caps its Vite peer dep at ^7, so fall back to
    // Vite 7 when an older version is already installed in the workspace.
    const forceViteV7 = options.useReactRouter && !(0, version_utils_1.reactRouterSupportsVite8)(tree);
    const viteTask = await viteConfigurationGenerator(tree, {
        uiFramework: 'react',
        project: options.projectName,
        newProject: true,
        includeVitest: options.unitTestRunner === 'vitest',
        inSourceTests: options.inSourceTests,
        compiler: options.compiler,
        skipFormat: true,
        addPlugin: options.addPlugin,
        projectType: 'application',
        port: options.port,
        ...(forceViteV7 ? { useViteV7: true } : {}),
    });
    tasks.push(viteTask);
    createOrEditViteConfig(tree, {
        project: options.projectName,
        includeLib: false,
        includeVitest: options.unitTestRunner === 'vitest',
        inSourceTests: options.inSourceTests,
        rollupOptionsExternal: ["'react'", "'react-dom'", "'react/jsx-runtime'"],
        port: options.port,
        previewPort: options.port,
        useEsmExtension: true,
        ...(options.useReactRouter
            ? reactRouterFrameworkConfig
            : baseReactConfig),
    }, false);
}
async function setupVitestConfiguration(tree, options, tasks) {
    const { createOrEditViteConfig } = (0, devkit_1.ensurePackage)('@nx/vite', versions_1.nxVersion);
    (0, devkit_1.ensurePackage)('@nx/vitest', versions_1.nxVersion);
    const { configurationGenerator } = await Promise.resolve().then(() => __importStar(require('@nx/vitest/generators')));
    const vitestTask = await configurationGenerator(tree, {
        uiFramework: 'react',
        coverageProvider: 'v8',
        project: options.projectName,
        inSourceTests: options.inSourceTests,
        skipFormat: true,
        addPlugin: options.addPlugin,
    });
    tasks.push(vitestTask);
    createOrEditViteConfig(tree, {
        project: options.projectName,
        includeLib: false,
        includeVitest: true,
        inSourceTests: options.inSourceTests,
        rollupOptionsExternal: ["'react'", "'react-dom'", "'react/jsx-runtime'"],
        imports: [
            options.compiler === 'swc'
                ? `import react from '@vitejs/plugin-react-swc'`
                : `import react from '@vitejs/plugin-react'`,
        ],
        plugins: ['react()'],
        useEsmExtension: true,
    }, true);
    if (options.bundler === 'rsbuild') {
        tree.rename((0, devkit_1.joinPathFragments)(options.appProjectRoot, 'vite.config.mts'), (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'vitest.config.mts'));
    }
}
