"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = getOptions;
exports.resolveReportsDirectory = resolveReportsDirectory;
exports.getOptionsAsArgv = getOptionsAsArgv;
const devkit_1 = require("@nx/devkit");
const options_utils_1 = require("../../../utils/options-utils");
const path_1 = require("path");
const executor_utils_1 = require("../../../utils/executor-utils");
async function getOptions(options, context, projectRoot) {
    // Allows ESM to be required in CJS modules. Vite will be published as ESM in the future.
    const { loadConfigFromFile } = await (0, executor_utils_1.loadViteDynamicImport)();
    const viteConfigPath = (0, options_utils_1.normalizeViteConfigFilePath)(context.root, projectRoot, options.configFile);
    if (!viteConfigPath) {
        throw new Error((0, devkit_1.stripIndents) `
        Unable to load test config from config file ${viteConfigPath}.
        
        Please make sure that vitest is configured correctly, 
        or use the @nx/vitest:configuration generator to configure it for you.
        You can read more here: https://nx.dev/nx-api/vitest/generators/configuration
        `);
    }
    const resolved = await loadConfigFromFile({
        mode: options?.mode ?? 'test',
        command: 'serve',
    }, viteConfigPath);
    if (!resolved?.config?.['test']) {
        devkit_1.logger.warn((0, devkit_1.stripIndents) `Unable to load test config from config file ${resolved?.path ?? viteConfigPath}
  Some settings may not be applied as expected.
  You can manually set the config in the project, ${context.projectName}, configuration.
        `);
    }
    const root = projectRoot === '.'
        ? process.cwd()
        : (0, path_1.relative)(context.cwd, (0, devkit_1.joinPathFragments)(context.root, projectRoot));
    const { parseCLI } = await (0, executor_utils_1.loadVitestDynamicImport)();
    // Use parseCLI for Vitest-specific normalization/validation
    const { options: { watch, ...normalizedExtraArgs }, } = parseCLI(['vitest', ...getOptionsAsArgv(options)]);
    // Filter out options that are handled specially or are parseCLI artifacts
    const { 
    // Handled specially by executor
    testFiles: _testFiles, configFile: _configFile, mode: _mode, runMode: _runMode, reportsDirectory, coverage, reporter, reporters, 
    // parseCLI artifacts
    '--': _dashdash, color: _color, w: _w, 
    // Pass through any additional Vitest options
    ...passThroughOptions } = normalizedExtraArgs;
    return {
        // Explicitly set watch mode to false if not provided otherwise vitest
        // will enable watch mode by default for non CI environments
        watch: watch ?? false,
        // Pass through any additional Vitest options
        ...passThroughOptions,
        // This should not be needed as it's going to be set in vite.config.ts
        // but leaving it here in case someone did not migrate correctly
        root: resolved?.config?.root ?? root,
        config: viteConfigPath,
        // Vitest's resolveConfig processes reporters in two steps:
        // 1. options.reporters (plural) sets resolved.reporters
        // 2. resolved.reporter (singular, from config) overwrites resolved.reporters
        // Setting reporter to [] prevents config's reporter from overriding NxReporter
        // (which is pushed onto reporters in vitest.impl.ts).
        reporter: [],
        reporters: reporter ??
            reporters ??
            // reporter (singular) has higher priority in vitest but is not declared in InlineConfig
            resolved?.config?.['test']?.reporter ??
            resolved?.config?.['test']?.reporters,
        coverage: {
            ...(coverage ?? {}),
            ...(reportsDirectory && {
                reportsDirectory: resolveReportsDirectory(reportsDirectory),
            }),
        },
    };
}
/**
 * Nx's resolveNxTokensInOptions strips {workspaceRoot}/ from option values,
 * leaving a workspace-root-relative path. However, vitest resolves
 * reportsDirectory relative to the project root. This function converts
 * the path to absolute so vitest resolves it correctly.
 */
function resolveReportsDirectory(reportsDirectory) {
    if ((0, path_1.isAbsolute)(reportsDirectory)) {
        return reportsDirectory;
    }
    return (0, path_1.resolve)(devkit_1.workspaceRoot, reportsDirectory);
}
function getOptionsAsArgv(obj) {
    const argv = [];
    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            value.forEach((item) => argv.push(`--${key}=${item}`));
        }
        else if (typeof value === 'object' && value !== null) {
            argv.push(`--${key}='${JSON.stringify(value)}'`);
        }
        else {
            argv.push(`--${key}=${value}`);
        }
    }
    return argv;
}
