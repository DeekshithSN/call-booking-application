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
exports.addE2e = addE2e;
const devkit_1 = require("@nx/devkit");
const web_1 = require("@nx/web");
const versions_1 = require("../../../utils/versions");
const has_webpack_plugin_1 = require("../../../utils/has-webpack-plugin");
const has_vite_plugin_1 = require("../../../utils/has-vite-plugin");
const has_rspack_plugin_1 = require("../../../utils/has-rspack-plugin");
const has_rsbuild_plugin_1 = require("../../../utils/has-rsbuild-plugin");
async function addE2e(tree, options) {
    const hasNxBuildPlugin = (options.bundler === 'webpack' && (0, has_webpack_plugin_1.hasWebpackPlugin)(tree)) ||
        (options.bundler === 'rspack' && (0, has_rspack_plugin_1.hasRspackPlugin)(tree)) ||
        (options.bundler === 'rsbuild' &&
            (await (0, has_rsbuild_plugin_1.hasRsbuildPlugin)(tree, options.appProjectRoot))) ||
        (options.bundler === 'vite' && (0, has_vite_plugin_1.hasVitePlugin)(tree));
    let e2eWebServerInfo = {
        e2eWebServerAddress: `http://localhost:${options.devServerPort ?? 4200}`,
        e2eWebServerCommand: `${(0, devkit_1.getPackageManagerCommand)().exec} nx run ${options.projectName}:serve`,
        e2eCiWebServerCommand: `${(0, devkit_1.getPackageManagerCommand)().exec} nx run ${options.projectName}:serve-static`,
        e2eCiBaseUrl: `http://localhost:${options.port ?? 4200}`,
        e2eDevServerTarget: `${options.projectName}:serve`,
    };
    if (options.bundler === 'webpack') {
        const { getWebpackE2EWebServerInfo } = (0, devkit_1.ensurePackage)('@nx/webpack', versions_1.nxVersion);
        e2eWebServerInfo = await getWebpackE2EWebServerInfo(tree, options.projectName, (0, devkit_1.joinPathFragments)(options.appProjectRoot, `webpack.config.${options.js ? 'js' : 'ts'}`), options.addPlugin, options.devServerPort ?? 4200);
    }
    else if (options.bundler === 'rspack') {
        const { getRspackE2EWebServerInfo } = (0, devkit_1.ensurePackage)('@nx/rspack', versions_1.nxVersion);
        e2eWebServerInfo = await getRspackE2EWebServerInfo(tree, options.projectName, (0, devkit_1.joinPathFragments)(options.appProjectRoot, `rspack.config.${options.js ? 'js' : 'ts'}`), options.addPlugin, options.devServerPort ?? 4200);
    }
    else if (options.bundler === 'vite') {
        const { getViteE2EWebServerInfo, getReactRouterE2EWebServerInfo } = (0, devkit_1.ensurePackage)('@nx/vite', versions_1.nxVersion);
        e2eWebServerInfo = options.useReactRouter
            ? await getReactRouterE2EWebServerInfo(tree, options.projectName, (0, devkit_1.joinPathFragments)(options.appProjectRoot, `vite.config.${options.js ? 'js' : 'ts'}`), options.addPlugin, options.devServerPort ?? 4200, 
            // If the user manually sets the port, then use it for dev and preview
            options.port)
            : await getViteE2EWebServerInfo(tree, options.projectName, (0, devkit_1.joinPathFragments)(options.appProjectRoot, `vite.config.${options.js ? 'js' : 'ts'}`), options.addPlugin, options.devServerPort ?? 4200, 
            // If the user manually sets the port, then use it for dev and preview
            options.port);
    }
    else if (options.bundler === 'rsbuild') {
        (0, devkit_1.ensurePackage)('@nx/rsbuild', versions_1.nxVersion);
        const { getRsbuildE2EWebServerInfo } = await Promise.resolve().then(() => __importStar(require('@nx/rsbuild/config-utils')));
        e2eWebServerInfo = await getRsbuildE2EWebServerInfo(tree, options.projectName, (0, devkit_1.joinPathFragments)(options.appProjectRoot, `rsbuild.config.${options.js ? 'js' : 'ts'}`), options.addPlugin, options.devServerPort ?? 4200);
    }
    if (!hasNxBuildPlugin) {
        await (0, web_1.webStaticServeGenerator)(tree, {
            buildTarget: `${options.projectName}:build`,
            targetName: 'serve-static',
            spa: true,
        });
    }
    switch (options.e2eTestRunner) {
        case 'cypress': {
            const { configurationGenerator } = (0, devkit_1.ensurePackage)('@nx/cypress', versions_1.nxVersion);
            const packageJson = {
                name: options.e2eProjectName,
                version: '0.0.1',
                private: true,
            };
            if (!options.useProjectJson) {
                packageJson.nx = {
                    implicitDependencies: [options.projectName],
                };
            }
            else {
                (0, devkit_1.addProjectConfiguration)(tree, options.e2eProjectName, {
                    projectType: 'application',
                    root: options.e2eProjectRoot,
                    sourceRoot: (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'src'),
                    targets: {},
                    implicitDependencies: [options.projectName],
                    tags: [],
                });
            }
            if (!options.useProjectJson || options.isUsingTsSolutionConfig) {
                (0, devkit_1.writeJson)(tree, (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'package.json'), packageJson);
            }
            const e2eTask = await configurationGenerator(tree, {
                ...options,
                project: options.e2eProjectName,
                directory: 'src',
                // the name and root are already normalized, instruct the generator to use them as is
                bundler: options.bundler === 'rspack'
                    ? 'webpack'
                    : options.bundler === 'rsbuild'
                        ? 'none'
                        : options.bundler,
                skipFormat: true,
                devServerTarget: e2eWebServerInfo.e2eDevServerTarget,
                baseUrl: e2eWebServerInfo.e2eWebServerAddress,
                jsx: true,
                rootProject: options.rootProject,
                webServerCommands: {
                    default: e2eWebServerInfo.e2eWebServerCommand,
                    production: e2eWebServerInfo.e2eCiWebServerCommand,
                },
                ciWebServerCommand: e2eWebServerInfo.e2eCiWebServerCommand,
                ciBaseUrl: e2eWebServerInfo.e2eCiBaseUrl,
            });
            return e2eTask;
        }
        case 'playwright': {
            const { configurationGenerator } = (0, devkit_1.ensurePackage)('@nx/playwright', versions_1.nxVersion);
            const packageJson = {
                name: options.e2eProjectName,
                version: '0.0.1',
                private: true,
            };
            if (!options.useProjectJson) {
                packageJson.nx = {
                    implicitDependencies: [options.projectName],
                };
            }
            else {
                (0, devkit_1.addProjectConfiguration)(tree, options.e2eProjectName, {
                    projectType: 'application',
                    root: options.e2eProjectRoot,
                    sourceRoot: (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'src'),
                    targets: {},
                    implicitDependencies: [options.projectName],
                    tags: [],
                });
            }
            if (!options.useProjectJson || options.isUsingTsSolutionConfig) {
                (0, devkit_1.writeJson)(tree, (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'package.json'), packageJson);
            }
            const e2eTask = await configurationGenerator(tree, {
                project: options.e2eProjectName,
                skipFormat: true,
                skipPackageJson: options.skipPackageJson,
                directory: 'src',
                js: false,
                linter: options.linter,
                setParserOptionsProject: options.setParserOptionsProject,
                webServerCommand: e2eWebServerInfo.e2eCiWebServerCommand,
                webServerAddress: e2eWebServerInfo.e2eCiBaseUrl,
                rootProject: options.rootProject,
                addPlugin: options.addPlugin,
            });
            return e2eTask;
        }
        case 'none':
        default:
            return () => { };
    }
}
