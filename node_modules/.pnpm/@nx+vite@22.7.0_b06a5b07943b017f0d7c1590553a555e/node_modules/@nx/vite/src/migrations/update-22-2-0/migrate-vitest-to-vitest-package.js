"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = migrateVitestToVitestPackage;
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const versions_1 = require("../../utils/versions");
/**
 * Migrates Vitest usage from @nx/vite to @nx/vitest package.
 *
 * This migration:
 * 1. Installs @nx/vitest package if not present
 * 2. Converts @nx/vite:test executor usages to @nx/vitest:test
 * 3. Splits @nx/vite/plugin configurations to add @nx/vitest plugin
 * 4. Migrates targetDefaults from @nx/vite:test to @nx/vitest:test
 */
async function migrateVitestToVitestPackage(tree) {
    const installTask = installVitestPackageIfNeeded(tree);
    migrateExecutorUsages(tree);
    migratePluginConfigurations(tree);
    migrateTargetDefaults(tree);
    await (0, devkit_1.formatFiles)(tree);
    return installTask;
}
function installVitestPackageIfNeeded(tree) {
    const packageJson = (0, devkit_1.readJson)(tree, 'package.json');
    const hasVitest = packageJson.dependencies?.['@nx/vitest'] ||
        packageJson.devDependencies?.['@nx/vitest'];
    if (hasVitest) {
        return () => { };
    }
    return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { '@nx/vitest': versions_1.nxVersion });
}
function migrateExecutorUsages(tree) {
    const projectsToUpdate = new Set();
    (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nx/vite:test', (_options, projectName, _targetName, _configuration) => {
        projectsToUpdate.add(projectName);
    });
    for (const projectName of projectsToUpdate) {
        const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, projectName);
        for (const [targetName, target] of Object.entries(projectConfig.targets || {})) {
            if (target.executor === '@nx/vite:test') {
                target.executor = '@nx/vitest:test';
            }
        }
        (0, devkit_1.updateProjectConfiguration)(tree, projectName, projectConfig);
    }
}
function migratePluginConfigurations(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (!nxJson?.plugins) {
        return;
    }
    const newPlugins = [];
    const vitestPluginsToAdd = [];
    const hasVitestPlugin = nxJson.plugins.some((p) => typeof p === 'string' ? p === '@nx/vitest' : p.plugin === '@nx/vitest');
    for (const plugin of nxJson.plugins) {
        // Handle string plugin format
        if (typeof plugin === 'string') {
            newPlugins.push(plugin);
            continue;
        }
        // Handle non-vite plugins
        if (plugin.plugin !== '@nx/vite/plugin') {
            newPlugins.push(plugin);
            continue;
        }
        const options = plugin.options || {};
        const { testTargetName, ciTargetName, ciGroupName, ...viteOptions } = options;
        // Check if this plugin has test-related options
        if (testTargetName || ciTargetName || ciGroupName) {
            // Build vitest plugin for THIS specific vite plugin registration
            const vitestPluginOptions = {};
            if (testTargetName) {
                vitestPluginOptions.testTargetName = testTargetName;
            }
            if (ciTargetName) {
                vitestPluginOptions.ciTargetName = ciTargetName;
            }
            if (ciGroupName) {
                vitestPluginOptions.ciGroupName = ciGroupName;
            }
            const vitestPlugin = {
                plugin: '@nx/vitest',
            };
            if (Object.keys(vitestPluginOptions).length > 0) {
                vitestPlugin.options = vitestPluginOptions;
            }
            if (plugin.include) {
                vitestPlugin.include = plugin.include;
            }
            if (plugin.exclude) {
                vitestPlugin.exclude = plugin.exclude;
            }
            vitestPluginsToAdd.push(vitestPlugin);
            // Update the vite plugin to remove test options
            const updatedVitePlugin = { ...plugin };
            if (Object.keys(viteOptions).length > 0) {
                updatedVitePlugin.options = viteOptions;
            }
            else {
                delete updatedVitePlugin.options;
            }
            newPlugins.push(updatedVitePlugin);
        }
        else {
            newPlugins.push(plugin);
        }
    }
    // Add all vitest plugins if @nx/vitest not already present
    if (!hasVitestPlugin && vitestPluginsToAdd.length > 0) {
        newPlugins.push(...vitestPluginsToAdd);
    }
    nxJson.plugins = newPlugins;
    (0, devkit_1.updateNxJson)(tree, nxJson);
}
function migrateTargetDefaults(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (!nxJson?.targetDefaults) {
        return;
    }
    let hasChanges = false;
    for (const [targetOrExecutor, targetConfig] of Object.entries(nxJson.targetDefaults)) {
        // Pattern A: Executor-keyed (e.g., "@nx/vite:test": { ... })
        if (targetOrExecutor === '@nx/vite:test') {
            // Move config to new executor key
            nxJson.targetDefaults['@nx/vitest:test'] ??= {};
            Object.assign(nxJson.targetDefaults['@nx/vitest:test'], targetConfig);
            delete nxJson.targetDefaults['@nx/vite:test'];
            hasChanges = true;
        }
        // Pattern B: Target-name-keyed (e.g., "test": { "executor": "@nx/vite:test", ... })
        else if (targetConfig.executor === '@nx/vite:test') {
            targetConfig.executor = '@nx/vitest:test';
            hasChanges = true;
        }
    }
    if (hasChanges) {
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
}
