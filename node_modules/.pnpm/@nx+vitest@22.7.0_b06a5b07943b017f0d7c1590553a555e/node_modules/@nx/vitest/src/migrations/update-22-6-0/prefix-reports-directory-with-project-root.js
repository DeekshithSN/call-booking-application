"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = prefixReportsDirectoryWithProjectRoot;
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const path_1 = require("path");
/**
 * Migrates reportsDirectory option for @nx/vitest:test and @nx/vite:test executors.
 *
 * Previously, reportsDirectory was resolved relative to the project root (cwd).
 * Now it is resolved relative to the workspace root. This migration prepends
 * {projectRoot}/ to existing naked paths so the resolved location stays the same.
 */
function prefixReportsDirectoryWithProjectRoot(tree) {
    migrateProjectConfigurations(tree);
    migrateTargetDefaults(tree);
}
function migrateProjectConfigurations(tree) {
    const projectsToUpdate = new Map();
    for (const executorName of ['@nx/vitest:test', '@nx/vite:test']) {
        (0, executor_options_utils_1.forEachExecutorOptions)(tree, executorName, (options, projectName, targetName, configuration) => {
            if (needsMigration(options.reportsDirectory)) {
                if (!projectsToUpdate.has(projectName)) {
                    projectsToUpdate.set(projectName, new Map());
                }
                const key = configuration
                    ? `${targetName}::${configuration}`
                    : targetName;
                projectsToUpdate
                    .get(projectName)
                    .set(key, { target: targetName, configuration });
            }
        });
    }
    for (const [projectName] of projectsToUpdate) {
        const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, projectName);
        for (const [_targetName, target] of Object.entries(projectConfig.targets || {})) {
            if (target.executor !== '@nx/vitest:test' &&
                target.executor !== '@nx/vite:test') {
                continue;
            }
            if (needsMigration(target.options?.reportsDirectory)) {
                target.options.reportsDirectory = prependProjectRoot(target.options.reportsDirectory);
            }
            if (target.configurations) {
                for (const config of Object.values(target.configurations)) {
                    if (needsMigration(config?.reportsDirectory)) {
                        config.reportsDirectory = prependProjectRoot(config.reportsDirectory);
                    }
                }
            }
        }
        (0, devkit_1.updateProjectConfiguration)(tree, projectName, projectConfig);
    }
}
function migrateTargetDefaults(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (!nxJson?.targetDefaults) {
        return;
    }
    let hasChanges = false;
    for (const [_key, targetConfig] of Object.entries(nxJson.targetDefaults)) {
        if (targetConfig.executor !== '@nx/vitest:test' &&
            targetConfig.executor !== '@nx/vite:test' &&
            _key !== '@nx/vitest:test' &&
            _key !== '@nx/vite:test') {
            continue;
        }
        if (needsMigration(targetConfig.options?.reportsDirectory)) {
            targetConfig.options.reportsDirectory = prependProjectRoot(targetConfig.options.reportsDirectory);
            hasChanges = true;
        }
        if (targetConfig.configurations) {
            for (const config of Object.values(targetConfig.configurations)) {
                if (needsMigration(config?.reportsDirectory)) {
                    config.reportsDirectory = prependProjectRoot(config.reportsDirectory);
                    hasChanges = true;
                }
            }
        }
    }
    if (hasChanges) {
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
}
function needsMigration(reportsDirectory) {
    if (!reportsDirectory) {
        return false;
    }
    if ((0, path_1.isAbsolute)(reportsDirectory)) {
        return false;
    }
    // Already starts with {projectRoot} — already project-root-relative
    if (reportsDirectory.startsWith('{projectRoot}')) {
        return false;
    }
    // Already starts with {workspaceRoot} — user intended workspace-root-relative
    if (reportsDirectory.startsWith('{workspaceRoot}')) {
        return false;
    }
    return true;
}
function prependProjectRoot(reportsDirectory) {
    return `{projectRoot}/${reportsDirectory}`;
}
