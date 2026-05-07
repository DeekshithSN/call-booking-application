"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const EXECUTOR_TO_MIGRATE = '@nx/jest:jest';
async function default_1(tree) {
    // update options from project configs
    (0, executor_options_utils_1.forEachExecutorOptions)(tree, EXECUTOR_TO_MIGRATE, (options, project, target, configuration) => {
        if (options.tsConfig === undefined) {
            return;
        }
        const projectConfiguration = (0, devkit_1.readProjectConfiguration)(tree, project);
        if (configuration) {
            updateConfiguration(projectConfiguration.targets[target], configuration);
        }
        else {
            updateOptions(projectConfiguration.targets[target]);
        }
        (0, devkit_1.updateProjectConfiguration)(tree, project, projectConfiguration);
    });
    // update options from nx.json target defaults
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (nxJson.targetDefaults) {
        for (const [targetOrExecutor, targetConfig] of Object.entries(nxJson.targetDefaults)) {
            if (targetOrExecutor !== EXECUTOR_TO_MIGRATE &&
                targetConfig.executor !== EXECUTOR_TO_MIGRATE) {
                continue;
            }
            if (targetConfig.options) {
                updateOptions(targetConfig);
            }
            Object.keys(targetConfig.configurations ?? {}).forEach((config) => {
                updateConfiguration(targetConfig, config);
            });
            if (!Object.keys(targetConfig).length ||
                (Object.keys(targetConfig).length === 1 &&
                    Object.keys(targetConfig)[0] === 'executor')) {
                delete nxJson.targetDefaults[targetOrExecutor];
            }
            if (!Object.keys(nxJson.targetDefaults).length) {
                delete nxJson.targetDefaults;
            }
        }
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
    await (0, devkit_1.formatFiles)(tree);
}
function updateOptions(target) {
    delete target.options.tsConfig;
    if (!Object.keys(target.options).length) {
        delete target.options;
    }
}
function updateConfiguration(target, configuration) {
    delete target.configurations[configuration].tsConfig;
    if (!Object.keys(target.configurations[configuration]).length &&
        (!target.defaultConfiguration ||
            target.defaultConfiguration !== configuration)) {
        delete target.configurations[configuration];
    }
    if (!Object.keys(target.configurations).length) {
        delete target.configurations;
    }
}
