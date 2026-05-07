"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = getOptions;
exports.getOptionsAsArgv = getOptionsAsArgv;
const devkit_1 = require("@nx/devkit");
const options_utils_1 = require("../../../utils/options-utils");
const path_1 = require("path");
const executor_utils_1 = require("../../../utils/executor-utils");
async function getOptions(options, context, projectRoot) {
    // Allows ESM to be required in CJS modules. Vite will be published as ESM in the future.
    const { loadConfigFromFile, mergeConfig } = await (0, executor_utils_1.loadViteDynamicImport)();
    const viteConfigPath = (0, options_utils_1.normalizeViteConfigFilePath)(context.root, projectRoot, options.configFile);
    if (!viteConfigPath) {
        throw new Error((0, devkit_1.stripIndents) `
        Unable to load test config from config file ${viteConfigPath}.
        
        Please make sure that vitest is configured correctly, 
        or use the @nx/vite:vitest generator to configure it for you.
        You can read more here: https://nx.dev/nx-api/vite/generators/vitest
        `);
    }
    const resolved = await loadConfigFromFile({
        mode: options?.mode ?? 'production',
        command: 'serve',
    }, viteConfigPath);
    if (!viteConfigPath || !resolved?.config?.['test']) {
        devkit_1.logger.warn((0, devkit_1.stripIndents) `Unable to load test config from config file ${resolved?.path ?? viteConfigPath}
  Some settings may not be applied as expected.
  You can manually set the config in the project, ${context.projectName}, configuration.
        `);
    }
    const root = projectRoot === '.'
        ? process.cwd()
        : (0, path_1.relative)(context.cwd, (0, devkit_1.joinPathFragments)(context.root, projectRoot));
    const { parseCLI } = await (0, executor_utils_1.loadVitestDynamicImport)();
    const { options: { watch, ...normalizedExtraArgs }, } = parseCLI(['vitest', ...getOptionsAsArgv(options)]);
    const { reportsDirectory, coverage, ...restNormalizedArgs } = normalizedExtraArgs;
    const settings = {
        // Explicitly set watch mode to false if not provided otherwise vitest
        // will enable watch mode by default for non CI environments
        watch: watch ?? false,
        ...restNormalizedArgs,
        // This should not be needed as it's going to be set in vite.config.ts
        // but leaving it here in case someone did not migrate correctly
        root: resolved.config.root ?? root,
        config: viteConfigPath,
        coverage: {
            ...(coverage ?? {}),
            ...(reportsDirectory && { reportsDirectory }),
        },
    };
    return mergeConfig(resolved?.config?.['test'] ?? {}, settings);
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
