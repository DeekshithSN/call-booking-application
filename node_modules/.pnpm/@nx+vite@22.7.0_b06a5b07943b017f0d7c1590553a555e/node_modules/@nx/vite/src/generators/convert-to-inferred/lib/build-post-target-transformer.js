"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPostTargetTransformer = buildPostTargetTransformer;
exports.moveBuildLibsFromSourceToViteConfig = moveBuildLibsFromSourceToViteConfig;
const devkit_1 = require("@nx/devkit");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const posix_1 = require("path/posix");
const utils_1 = require("./utils");
const plugin_migration_utils_1 = require("@nx/devkit/src/generators/plugin-migrations/plugin-migration-utils");
function buildPostTargetTransformer(target, tree, projectDetails, inferredTargetConfiguration) {
    let viteConfigPath = (0, utils_1.getViteConfigPath)(tree, projectDetails.root);
    const configValues = {
        default: {},
    };
    if (target.configurations) {
        for (const configurationName in target.configurations) {
            const configuration = target.configurations[configurationName];
            configValues[configurationName] = {};
            let configurationConfigFile = viteConfigPath;
            if (configuration.configFile) {
                if ('buildLibsFromSource' in target.options) {
                    configuration.buildLibsFromSource =
                        target.options.buildLibsFromSource;
                }
                configurationConfigFile = configuration.configFile;
            }
            removePropertiesFromTargetOptions(tree, configuration, configurationConfigFile, projectDetails.root, configValues[configurationName], configuration.configFile && configuration.configFile !== viteConfigPath);
        }
        for (const configurationName in target.configurations) {
            const configuration = target.configurations[configurationName];
            if (configuration.config &&
                configuration.config !==
                    (0, utils_1.toProjectRelativePath)(viteConfigPath, projectDetails.root)) {
                const configFilePath = (0, devkit_1.joinPathFragments)(projectDetails.root, configuration.config);
                (0, utils_1.addConfigValuesToViteConfig)(tree, configFilePath, configValues);
            }
        }
        if (Object.keys(target.configurations).length === 0) {
            if ('defaultConfiguration' in target) {
                delete target.defaultConfiguration;
            }
            delete target.configurations;
        }
        if ('defaultConfiguration' in target &&
            !target.configurations[target.defaultConfiguration]) {
            delete target.defaultConfiguration;
        }
    }
    if (target.options) {
        if (target.options.configFile) {
            viteConfigPath = target.options.configFile;
        }
        removePropertiesFromTargetOptions(tree, target.options, viteConfigPath, projectDetails.root, configValues['default'], true);
    }
    if (target.outputs) {
        (0, plugin_migration_utils_1.processTargetOutputs)(target, [{ newName: 'outDir', oldName: 'outputPath' }], inferredTargetConfiguration, {
            projectName: projectDetails.projectName,
            projectRoot: projectDetails.root,
        });
    }
    if (target.inputs &&
        target.inputs.every((i) => i === 'production' || i === '^production')) {
        delete target.inputs;
    }
    (0, utils_1.addConfigValuesToViteConfig)(tree, viteConfigPath, configValues);
    return target;
}
function removePropertiesFromTargetOptions(tree, targetOptions, viteConfigPath, projectRoot, configValues, needsAstTransform = false) {
    if ('configFile' in targetOptions) {
        targetOptions.config = (0, utils_1.toProjectRelativePath)(targetOptions.configFile, projectRoot);
        delete targetOptions.configFile;
    }
    if (targetOptions.outputPath) {
        targetOptions.outDir = (0, utils_1.toProjectRelativePath)(targetOptions.outputPath, projectRoot);
        delete targetOptions.outputPath;
    }
    if ('buildLibsFromSource' in targetOptions) {
        configValues['buildLibsFromSource'] = targetOptions.buildLibsFromSource;
        if (needsAstTransform) {
            moveBuildLibsFromSourceToViteConfig(tree, viteConfigPath);
        }
        delete targetOptions.buildLibsFromSource;
    }
    if ('skipTypeCheck' in targetOptions) {
        delete targetOptions.skipTypeCheck;
    }
    if ('generatePackageJson' in targetOptions) {
        delete targetOptions.generatePackageJson;
    }
    if ('includeDevDependenciesInPackageJson' in targetOptions) {
        delete targetOptions.includeDevDependenciesInPackageJson;
    }
    if ('tsConfig' in targetOptions) {
        delete targetOptions.tsConfig;
    }
}
function moveBuildLibsFromSourceToViteConfig(tree, configPath) {
    const PLUGINS_PROPERTY_SELECTOR = 'PropertyAssignment:has(Identifier[name=plugins])';
    const PLUGINS_NX_VITE_TS_PATHS_SELECTOR = 'PropertyAssignment:has(Identifier[name=plugins]) CallExpression:has(Identifier[name=nxViteTsPaths])';
    const BUILD_LIBS_FROM_SOURCE_SELECTOR = 'PropertyAssignment:has(Identifier[name=plugins]) CallExpression:has(Identifier[name=nxViteTsPaths]) ObjectLiteralExpression > PropertyAssignment:has(Identifier[name=buildLibsFromSource])';
    const nxViteTsPathsImport = (0, posix_1.extname)(configPath) === 'js'
        ? 'const {nxViteTsPaths} = require("@nx/vite/plugins/nx-tsconfig-paths.plugin");'
        : 'import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";';
    const plugin = `nxViteTsPaths({ buildLibsFromSource: options.buildLibsFromSource }),`;
    const viteConfigContents = tree.read(configPath, 'utf-8');
    let newViteConfigContents = viteConfigContents;
    const sourceFile = (0, tsquery_1.ast)(viteConfigContents);
    const buildLibsFromSourceNodes = (0, tsquery_1.query)(sourceFile, BUILD_LIBS_FROM_SOURCE_SELECTOR);
    if (buildLibsFromSourceNodes.length > 0) {
        return;
    }
    const nxViteTsPathsNodes = (0, tsquery_1.query)(sourceFile, PLUGINS_NX_VITE_TS_PATHS_SELECTOR);
    if (nxViteTsPathsNodes.length === 0) {
        const pluginsNodes = (0, tsquery_1.query)(sourceFile, PLUGINS_PROPERTY_SELECTOR);
        if (pluginsNodes.length === 0) {
            // Add plugin property
            const configNodes = (0, tsquery_1.query)(sourceFile, 'CallExpression:has(Identifier[name=defineConfig]) > ObjectLiteralExpression');
            if (configNodes.length === 0) {
                return;
            }
            newViteConfigContents = `${nxViteTsPathsImport}\n${viteConfigContents.slice(0, configNodes[0].getStart() + 1)}plugins: [${plugin}],${viteConfigContents.slice(configNodes[0].getStart() + 1)}`;
        }
        else {
            // Add nxViteTsPaths plugin
            const pluginsArrayNodes = (0, tsquery_1.query)(pluginsNodes[0], 'ArrayLiteralExpression');
            if (pluginsArrayNodes.length === 0) {
                return;
            }
            newViteConfigContents = `${nxViteTsPathsImport}\n${viteConfigContents.slice(0, pluginsArrayNodes[0].getStart() + 1)}${plugin}${viteConfigContents.slice(pluginsArrayNodes[0].getStart() + 1)}`;
        }
    }
    else {
        const pluginOptionsNodes = (0, tsquery_1.query)(nxViteTsPathsNodes[0], 'ObjectLiteralExpression');
        if (pluginOptionsNodes.length === 0) {
            // Add the options
            newViteConfigContents = `${viteConfigContents.slice(0, nxViteTsPathsNodes[0].getStart())}${plugin}${viteConfigContents.slice(nxViteTsPathsNodes[0].getEnd())}`;
        }
        else {
            // update the object
            newViteConfigContents = `${viteConfigContents.slice(0, pluginOptionsNodes[0].getStart() + 1)}buildLibsFromSource: options.buildLibsFromSource, ${viteConfigContents.slice(pluginOptionsNodes[0].getStart() + 1)}`;
        }
    }
    tree.write(configPath, newViteConfigContents);
}
