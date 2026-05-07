"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
// migration for https://github.com/jestjs/jest/commit/41133b526d2c17bc9758f90d6026b25301cf0552
async function default_1(tree) {
    // update options from project configs
    (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nx/jest:jest', (_, project, target, configuration) => {
        const projectConfiguration = (0, devkit_1.readProjectConfiguration)(tree, project);
        const config = configuration
            ? projectConfiguration.targets[target].configurations[configuration]
            : projectConfiguration.targets[target].options;
        renameTestPathPattern(config);
        (0, devkit_1.updateProjectConfiguration)(tree, project, projectConfiguration);
    });
    // update options from nx.json target defaults
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (!nxJson.targetDefaults) {
        return;
    }
    for (const [targetOrExecutor, targetConfig] of Object.entries(nxJson.targetDefaults)) {
        if (targetOrExecutor !== '@nx/jest:jest' &&
            targetConfig.executor !== '@nx/jest:jest') {
            continue;
        }
        if (targetConfig.options) {
            renameTestPathPattern(targetConfig.options);
        }
        Object.values(targetConfig.configurations ?? {}).forEach((config) => {
            renameTestPathPattern(config);
        });
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
    await (0, devkit_1.formatFiles)(tree);
}
function renameTestPathPattern(config) {
    if (!config.testPathPattern) {
        return;
    }
    config.testPathPatterns = config.testPathPattern;
    delete config.testPathPattern;
}
