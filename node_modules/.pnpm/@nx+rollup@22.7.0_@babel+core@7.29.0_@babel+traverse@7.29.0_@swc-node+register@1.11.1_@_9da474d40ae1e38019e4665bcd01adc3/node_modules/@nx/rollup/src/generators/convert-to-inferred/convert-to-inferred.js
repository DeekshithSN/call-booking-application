"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToInferred = convertToInferred;
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const extract_rollup_config_from_executor_options_1 = require("./lib/extract-rollup-config-from-executor-options");
const add_plugin_registrations_1 = require("./lib/add-plugin-registrations");
const executor_to_plugin_migrator_1 = require("@nx/devkit/src/generators/plugin-migrations/executor-to-plugin-migrator");
async function convertToInferred(tree, options) {
    const migratedProjects = new Map();
    let projects = (0, devkit_1.getProjects)(tree);
    (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nx/rollup:rollup', (_, projectName, targetName, configurationName) => {
        if (options.project && projectName !== options.project)
            return;
        const project = projects.get(projectName);
        const target = project.targets[targetName];
        // We'll handle configurations when dealing with default options.
        if (configurationName)
            return;
        // Since targetDefaults for '@nx/rollup:rollup' will no longer apply, we want to copy them to the target options.
        const nxJson = (0, devkit_1.readNxJson)(tree);
        const defaults = nxJson.targetDefaults['@nx/rollup:rollup'];
        if (defaults) {
            for (const [key, value] of Object.entries(defaults)) {
                target[key] ??= value;
            }
        }
        const extractedPluginOptions = (0, extract_rollup_config_from_executor_options_1.extractRollupConfigFromExecutorOptions)(tree, target.options, target.configurations, project.root);
        // If rollup is not an external dependency, add it
        if (target.inputs &&
            !target.inputs.some((i) => Array.isArray(i['externalDependencies']) &&
                i['externalDependencies'].includes('rollup'))) {
            const idx = target.inputs.findIndex((i) => Array.isArray(i['externalDependencies']));
            if (idx === -1) {
                target.inputs.push({ externalDependencies: ['rollup'] });
            }
            else {
                target.inputs[idx]['externalDependencies'].push('rollup');
            }
        }
        // Clean up the target now that it is inferred
        delete target.executor;
        if (target.outputs &&
            target.outputs.length === 1 &&
            // "{projectRoot}/{options.outputPath}" is an invalid output for Rollup since
            // there would be a mismatch between where the executor outputs to and where Nx caches.
            // If users have this set erroneously, then it will continue to not work.
            (target.outputs[0] === '{options.outputPath}' ||
                target.outputs[0] === '{workspaceRoot}/{options.outputPath}')) {
            // If only the default `options.outputPath` is set as output, remove it and use path inferred from `rollup.config.cjs`.
            delete target.outputs;
        }
        else {
            // Otherwise, replace `options.outputPath` with what is inferred from `rollup.config.cjs`.
            target.outputs = target.outputs.map((output) => 
            // Again, "{projectRoot}/{options.outputPath}" is an invalid output for Rollup.
            output === '{options.outputPath}' ||
                output === '{workspaceRoot}/{options.outputPath}'
                ? `{projectRoot}/${extractedPluginOptions.outputPath}`
                : output);
        }
        if (Object.keys(target.options).length === 0)
            delete target.options;
        if (Object.keys(target).length === 0)
            delete project.targets[targetName];
        (0, devkit_1.updateProjectConfiguration)(tree, projectName, project);
        migratedProjects.set(projectName, { buildTargetName: targetName });
    });
    if (migratedProjects.size === 0) {
        throw new executor_to_plugin_migrator_1.NoTargetsToMigrateError();
    }
    projects = (0, devkit_1.getProjects)(tree);
    await (0, add_plugin_registrations_1.addPluginRegistrations)(tree, migratedProjects, projects, '@nx/rollup/plugin');
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
}
exports.default = convertToInferred;
