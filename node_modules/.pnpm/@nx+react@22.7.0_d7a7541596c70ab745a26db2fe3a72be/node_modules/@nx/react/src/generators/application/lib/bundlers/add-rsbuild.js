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
exports.initRsbuild = initRsbuild;
exports.setupRsbuildConfiguration = setupRsbuildConfiguration;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../../../utils/versions");
const maybe_js_1 = require("../../../../utils/maybe-js");
async function initRsbuild(tree, options, tasks) {
    (0, devkit_1.ensurePackage)('@nx/rsbuild', versions_1.nxVersion);
    const { initGenerator } = await Promise.resolve().then(() => __importStar(require('@nx/rsbuild/generators')));
    const initTask = await initGenerator(tree, {
        skipPackageJson: options.skipPackageJson,
        addPlugin: true,
        skipFormat: true,
    });
    tasks.push(initTask);
}
async function setupRsbuildConfiguration(tree, options, tasks) {
    (0, devkit_1.ensurePackage)('@nx/rsbuild', versions_1.nxVersion);
    const { configurationGenerator } = await Promise.resolve().then(() => __importStar(require('@nx/rsbuild/generators')));
    const { addBuildPlugin, addCopyAssets, addHtmlTemplatePath, addExperimentalSwcPlugin, addSourceDefine, versions, } = await Promise.resolve().then(() => __importStar(require('@nx/rsbuild/config-utils')));
    const rsbuildTask = await configurationGenerator(tree, {
        project: options.projectName,
        entry: (0, maybe_js_1.maybeJs)({
            js: options.js,
            useJsx: true,
        }, `./src/main.tsx`),
        tsConfig: './tsconfig.app.json',
        target: 'web',
        devServerPort: options.devServerPort ?? 4200,
    });
    tasks.push(rsbuildTask);
    const pathToConfigFile = (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'rsbuild.config.ts');
    if (options.inSourceTests && options.unitTestRunner === 'vitest') {
        addSourceDefine(tree, pathToConfigFile, 'import.meta.vitest', 'undefined');
    }
    const deps = { '@rsbuild/plugin-react': versions.rsbuildPluginReactVersion };
    addBuildPlugin(tree, pathToConfigFile, '@rsbuild/plugin-react', 'pluginReact', options.style === '@emotion/styled'
        ? `swcReactOptions: {\n\timportSource: '@emotion/react',\n}`
        : undefined);
    if (options.style === 'scss') {
        addBuildPlugin(tree, pathToConfigFile, '@rsbuild/plugin-sass', 'pluginSass');
        deps['@rsbuild/plugin-sass'] = versions.rsbuildPluginSassVersion;
    }
    else if (options.style === 'less') {
        addBuildPlugin(tree, pathToConfigFile, '@rsbuild/plugin-less', 'pluginLess');
        deps['@rsbuild/plugin-less'] = versions.rsbuildPluginLessVersion;
    }
    else if (options.style === '@emotion/styled') {
        deps['@swc/plugin-emotion'] = versions.rsbuildSwcPluginEmotionVersion;
        addExperimentalSwcPlugin(tree, pathToConfigFile, '@swc/plugin-emotion');
    }
    else if (options.style === 'styled-jsx') {
        deps['@swc/plugin-styled-jsx'] = versions.rsbuildSwcPluginStyledJsxVersion;
        addExperimentalSwcPlugin(tree, pathToConfigFile, '@swc/plugin-styled-jsx');
    }
    else if (options.style === 'styled-components') {
        deps['@rsbuild/plugin-styled-components'] =
            versions.rsbuildPluginStyledComponentsVersion;
        addBuildPlugin(tree, pathToConfigFile, '@rsbuild/plugin-styled-components', 'pluginStyledComponents');
    }
    addHtmlTemplatePath(tree, pathToConfigFile, './src/index.html');
    addCopyAssets(tree, pathToConfigFile, './src/assets');
    addCopyAssets(tree, pathToConfigFile, './src/favicon.ico');
    tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {}, deps));
}
