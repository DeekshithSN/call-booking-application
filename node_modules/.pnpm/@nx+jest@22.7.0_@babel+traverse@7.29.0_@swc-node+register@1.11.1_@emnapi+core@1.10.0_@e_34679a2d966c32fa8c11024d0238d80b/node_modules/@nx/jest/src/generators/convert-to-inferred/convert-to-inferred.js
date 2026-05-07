"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToInferred = convertToInferred;
const devkit_1 = require("@nx/devkit");
const executor_to_plugin_migrator_1 = require("@nx/devkit/src/generators/plugin-migrations/executor-to-plugin-migrator");
const plugin_migration_utils_1 = require("@nx/devkit/src/generators/plugin-migrations/plugin-migration-utils");
const jest_config_1 = require("jest-config");
const node_path_1 = require("node:path");
const plugin_1 = require("../../plugins/plugin");
const config_file_1 = require("../../utils/config/config-file");
const versions_1 = require("../../utils/versions");
async function convertToInferred(tree, options) {
    const projectGraph = await (0, devkit_1.createProjectGraphAsync)();
    const migratedProjects = await (0, executor_to_plugin_migrator_1.migrateProjectExecutorsToPlugin)(tree, projectGraph, '@nx/jest/plugin', plugin_1.createNodesV2, { targetName: 'test' }, [
        {
            executors: ['@nx/jest:jest', '@nrwl/jest:jest'],
            postTargetTransformer,
            targetPluginOptionMapper: (targetName) => ({ targetName }),
        },
    ], options.project);
    if (migratedProjects.size === 0) {
        throw new executor_to_plugin_migrator_1.NoTargetsToMigrateError();
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
}
async function postTargetTransformer(target, tree, projectDetails, inferredTarget) {
    const jestConfigPath = config_file_1.jestConfigExtensions
        .map((ext) => `jest.config.${ext}`)
        .find((configFileName) => tree.exists(node_path_1.posix.join(projectDetails.root, configFileName)));
    if (target.options) {
        await updateOptionsObject(tree, target.options, projectDetails.root, tree.root, jestConfigPath);
    }
    if (target.configurations) {
        for (const [configName, config] of Object.entries(target.configurations)) {
            await updateConfigurationObject(tree, config, projectDetails.root, tree.root, jestConfigPath);
            if (!Object.keys(config).length) {
                delete target.configurations[configName];
            }
        }
        if (!Object.keys(target.configurations).length) {
            delete target.defaultConfiguration;
            delete target.configurations;
        }
        if ('defaultConfiguration' in target &&
            !target.configurations?.[target.defaultConfiguration]) {
            delete target.defaultConfiguration;
        }
    }
    if (target.outputs) {
        (0, plugin_migration_utils_1.processTargetOutputs)(target, [], inferredTarget, {
            projectName: projectDetails.projectName,
            projectRoot: projectDetails.root,
        });
    }
    return target;
}
exports.default = convertToInferred;
async function updateOptionsObject(tree, targetOptions, projectRoot, workspaceRoot, defaultJestConfigPath) {
    const jestConfigPath = targetOptions.jestConfig ?? defaultJestConfigPath;
    // inferred targets are only identified after known files that Jest would
    // pick up, so we can safely remove the config options
    delete targetOptions.jestConfig;
    delete targetOptions.config;
    await updateOptions(tree, targetOptions, projectRoot, workspaceRoot, jestConfigPath);
}
async function updateConfigurationObject(tree, targetOptions, projectRoot, workspaceRoot, defaultJestConfigPath) {
    const jestConfigPath = targetOptions.jestConfig ?? defaultJestConfigPath;
    if (targetOptions.jestConfig) {
        targetOptions.config = (0, plugin_migration_utils_1.toProjectRelativePath)(targetOptions.jestConfig, projectRoot);
        delete targetOptions.jestConfig;
    }
    else if (targetOptions.config) {
        targetOptions.config = (0, plugin_migration_utils_1.toProjectRelativePath)(targetOptions.config, projectRoot);
    }
    await updateOptions(tree, targetOptions, projectRoot, workspaceRoot, jestConfigPath);
}
async function updateOptions(tree, targetOptions, projectRoot, workspaceRoot, jestConfigPath) {
    // deprecated and unused
    delete targetOptions.tsConfig;
    if ('codeCoverage' in targetOptions) {
        targetOptions.coverage = targetOptions.codeCoverage;
        delete targetOptions.codeCoverage;
    }
    const testPathPatterns = [];
    if ('testFile' in targetOptions) {
        testPathPatterns.push(toProjectRelativeRegexPath(targetOptions.testFile, projectRoot));
        delete targetOptions.testFile;
    }
    let testPathPatternsOptionName;
    if ('testPathPattern' in targetOptions) {
        testPathPatternsOptionName = 'testPathPattern';
        testPathPatterns.push(...targetOptions.testPathPattern.map((pattern) => toProjectRelativeRegexPath(pattern, projectRoot)));
    }
    else if ('testPathPatterns' in targetOptions) {
        testPathPatternsOptionName = 'testPathPatterns';
        testPathPatterns.push(...targetOptions.testPathPatterns.map((pattern) => toProjectRelativeRegexPath(pattern, projectRoot)));
    }
    else {
        const jestMajorVersion = (0, versions_1.getInstalledJestMajorVersion)(tree);
        testPathPatternsOptionName =
            jestMajorVersion >= 30 ? 'testPathPatterns' : 'testPathPattern';
    }
    if (testPathPatterns.length > 1) {
        targetOptions[testPathPatternsOptionName] = `\"${testPathPatterns.join('|')}\"`;
    }
    else if (testPathPatterns.length === 1) {
        targetOptions[testPathPatternsOptionName] = testPathPatterns[0];
    }
    if ('testPathIgnorePatterns' in targetOptions) {
        if (targetOptions.testPathIgnorePatterns.length > 1) {
            targetOptions.testPathIgnorePatterns = `\"${targetOptions.testPathIgnorePatterns
                .map((pattern) => toProjectRelativeRegexPath(pattern, projectRoot))
                .join('|')}\"`;
        }
        else if (targetOptions.testPathIgnorePatterns.length === 1) {
            targetOptions.testPathIgnorePatterns = toProjectRelativeRegexPath(targetOptions.testPathIgnorePatterns[0], projectRoot);
        }
    }
    if ('testMatch' in targetOptions) {
        targetOptions.testMatch = targetOptions.testMatch
            .map((pattern) => `"${toProjectRelativeGlobPath(pattern, projectRoot)}"`)
            .join(' ');
    }
    if ('findRelatedTests' in targetOptions) {
        // the executor accepts a comma-separated string, while jest accepts a space-separated string
        const parsedSourceFiles = targetOptions.findRelatedTests
            .split(',')
            .map((s) => (0, plugin_migration_utils_1.toProjectRelativePath)(s.trim(), projectRoot))
            .join(' ');
        targetOptions.args = [`--findRelatedTests ${parsedSourceFiles}`];
        delete targetOptions.findRelatedTests;
    }
    if ('setupFile' in targetOptions) {
        const setupFiles = await processSetupFiles(targetOptions.setupFile, targetOptions.setupFilesAfterEnv, projectRoot, workspaceRoot, jestConfigPath);
        if (setupFiles.length > 1) {
            targetOptions.setupFilesAfterEnv = setupFiles
                .map((sf) => `"${sf}"`)
                .join(' ');
        }
        else if (setupFiles.length === 1) {
            targetOptions.setupFilesAfterEnv = setupFiles[0];
        }
        else {
            // if there are no setup files, it means they are already defined in the
            // jest config, so we can remove the option
            delete targetOptions.setupFilesAfterEnv;
        }
        delete targetOptions.setupFile;
    }
    if ('outputFile' in targetOptions) {
        // update the output file to be relative to the project root
        targetOptions.outputFile = (0, plugin_migration_utils_1.toProjectRelativePath)(targetOptions.outputFile, projectRoot);
    }
    if ('coverageDirectory' in targetOptions) {
        // update the coverage directory to be relative to the project root
        targetOptions.coverageDirectory = (0, plugin_migration_utils_1.toProjectRelativePath)(targetOptions.coverageDirectory, projectRoot);
    }
}
async function processSetupFiles(setupFile, setupFilesAfterEnv, projectRoot, workspaceRoot, jestConfigPath) {
    // the jest executor merges the setupFile with the setupFilesAfterEnv, so
    // to keep the task working as before we resolve the setupFilesAfterEnv
    // from the options or the jest config and add the setupFile to it
    // https://github.com/nrwl/nx/blob/bdd3375256613340899f649eb800d22abcc9f507/packages/jest/src/executors/jest/jest.impl.ts#L107-L113
    const configSetupFilesAfterEnv = [];
    if (jestConfigPath) {
        const jestConfig = await (0, jest_config_1.readConfig)({ setupFilesAfterEnv }, (0, node_path_1.join)(workspaceRoot, jestConfigPath));
        if (jestConfig.projectConfig.setupFilesAfterEnv) {
            configSetupFilesAfterEnv.push(...jestConfig.projectConfig.setupFilesAfterEnv.map((file) => (0, plugin_migration_utils_1.toProjectRelativePath)(file, projectRoot)));
        }
    }
    if (!configSetupFilesAfterEnv.length) {
        return [(0, plugin_migration_utils_1.toProjectRelativePath)(setupFile, projectRoot)];
    }
    if (isSetupFileInConfig(configSetupFilesAfterEnv, setupFile, projectRoot, workspaceRoot)) {
        // the setupFile is already included in the setupFilesAfterEnv
        return [];
    }
    return [
        ...configSetupFilesAfterEnv,
        (0, plugin_migration_utils_1.toProjectRelativePath)(setupFile, projectRoot),
    ];
}
function isSetupFileInConfig(setupFilesAfterEnv, setupFile, projectRoot, workspaceRoot) {
    const normalizePath = (f) => f.startsWith('<rootDir>')
        ? node_path_1.posix.join(workspaceRoot, projectRoot, f.slice('<rootDir>'.length))
        : node_path_1.posix.join(workspaceRoot, projectRoot, f);
    const normalizedSetupFiles = new Set(setupFilesAfterEnv.map(normalizePath));
    return normalizedSetupFiles.has(normalizePath((0, plugin_migration_utils_1.toProjectRelativePath)(setupFile, projectRoot)));
}
function toProjectRelativeRegexPath(path, projectRoot) {
    if (projectRoot === '.') {
        // workspace and project root are the same, keep the path as is
        return path;
    }
    const normalizedRoot = (0, node_path_1.normalize)(projectRoot);
    if (new RegExp(`^(?:\\.[\\/\\\\])?${normalizedRoot}(?:[\\/\\\\])?$`).test(path)) {
        // path includes everything inside project root
        return '.*';
    }
    const normalizedPath = (0, node_path_1.normalize)(path);
    const startWithProjectRootRegex = new RegExp(`^(?:\\.[\\/\\\\])?${normalizedRoot}[\\/\\\\]`);
    return startWithProjectRootRegex.test(normalizedPath)
        ? normalizedPath.replace(startWithProjectRootRegex, '')
        : path;
}
function toProjectRelativeGlobPath(path, projectRoot) {
    if (projectRoot === '.') {
        // workspace and project root are the same, keep the path as is
        return path;
    }
    // globs use forward slashes, so we make sure to normalize the path
    const normalizedRoot = node_path_1.posix.normalize(projectRoot);
    return path
        .replace(new RegExp(`\/${normalizedRoot}\/`), '/')
        .replace(/\*\*\/\*\*/g, '**');
}
