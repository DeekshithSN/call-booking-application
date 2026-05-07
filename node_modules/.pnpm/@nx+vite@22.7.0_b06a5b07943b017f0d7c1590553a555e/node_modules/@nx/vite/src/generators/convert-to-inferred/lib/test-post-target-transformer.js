"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testPostTargetTransformer = testPostTargetTransformer;
const utils_1 = require("./utils");
const plugin_migration_utils_1 = require("@nx/devkit/src/generators/plugin-migrations/plugin-migration-utils");
function testPostTargetTransformer(target, tree, projectDetails, inferredTargetConfiguration) {
    if (target.options) {
        removePropertiesFromTargetOptions(target.options, projectDetails.root);
    }
    if (target.configurations) {
        for (const configurationName in target.configurations) {
            const configuration = target.configurations[configurationName];
            removePropertiesFromTargetOptions(configuration, projectDetails.root);
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
    if (target.outputs) {
        (0, plugin_migration_utils_1.processTargetOutputs)(target, [{ newName: 'coverage.reportsDirectory', oldName: 'reportsDirectory' }], inferredTargetConfiguration, {
            projectName: projectDetails.projectName,
            projectRoot: projectDetails.root,
        });
    }
    if (target.inputs &&
        target.inputs.every((i) => i === 'default' || i === '^production')) {
        delete target.inputs;
    }
    return target;
}
function removePropertiesFromTargetOptions(targetOptions, projectRoot) {
    if ('configFile' in targetOptions) {
        targetOptions.config = (0, utils_1.toProjectRelativePath)(targetOptions.configFile, projectRoot);
        delete targetOptions.configFile;
    }
    if ('reportsDirectory' in targetOptions) {
        if (targetOptions.reportsDirectory.startsWith('../')) {
            targetOptions.reportsDirectory = targetOptions.reportsDirectory.replace(/(\.\.\/)+/, '');
        }
        targetOptions['coverage.reportsDirectory'] = (0, utils_1.toProjectRelativePath)(targetOptions.reportsDirectory, projectRoot);
        delete targetOptions.reportsDirectory;
    }
    if ('testFiles' in targetOptions) {
        targetOptions.testNamePattern = `"/(${targetOptions.testFiles
            .map((f) => f.replace('.', '\\.'))
            .join('|')})/"`;
        delete targetOptions.testFiles;
    }
}
