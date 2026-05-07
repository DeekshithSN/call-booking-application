"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAppFiles = addAppFiles;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const path_1 = require("path");
const has_webpack_plugin_1 = require("../../../utils/has-webpack-plugin");
const vscode_debug_config_1 = require("../../../utils/vscode-debug-config");
function addAppFiles(tree, options) {
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, '../files/common'), options.appProjectRoot, {
        ...options,
        tmpl: '',
        name: options.name,
        root: options.appProjectRoot,
        offset: (0, devkit_1.offsetFromRoot)(options.appProjectRoot),
        rootTsConfigPath: (0, js_1.getRelativePathToRootTsConfig)(tree, options.appProjectRoot),
        webpackPluginOptions: (0, has_webpack_plugin_1.hasWebpackPlugin)(tree) && options.addPlugin !== false
            ? {
                outputPath: options.isUsingTsSolutionConfig
                    ? 'dist'
                    : (0, devkit_1.joinPathFragments)((0, devkit_1.offsetFromRoot)(options.appProjectRoot), 'dist', options.rootProject ? options.name : options.appProjectRoot),
                main: './src/main' + (options.js ? '.js' : '.ts'),
                tsConfig: './tsconfig.app.json',
                assets: ['./src/assets'],
                generatePackageJson: !options.isUsingTsSolutionConfig,
            }
            : null,
    });
    if (options.bundler !== 'webpack') {
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, 'webpack.config.js'));
    }
    if (options.framework && options.framework !== 'none') {
        (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, `../files/${options.framework}`), options.appProjectRoot, {
            ...options,
            tmpl: '',
            name: options.name,
            root: options.appProjectRoot,
            offset: (0, devkit_1.offsetFromRoot)(options.appProjectRoot),
            rootTsConfigPath: (0, js_1.getRelativePathToRootTsConfig)(tree, options.appProjectRoot),
        });
    }
    if (options.js) {
        (0, devkit_1.toJS)(tree);
    }
    // Generate a debug config for VS Code so that users can easily debug their application
    (0, vscode_debug_config_1.addVSCodeDebugConfiguration)(tree, {
        projectName: options.name,
        projectRoot: options.appProjectRoot,
    });
}
