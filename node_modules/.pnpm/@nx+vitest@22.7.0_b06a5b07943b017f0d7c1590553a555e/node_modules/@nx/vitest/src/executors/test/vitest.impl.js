"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vitestExecutor = vitestExecutor;
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
const internal_1 = require("@nx/js/src/internal");
const nx_reporter_1 = require("./lib/nx-reporter");
const utils_1 = require("./lib/utils");
const executor_utils_1 = require("../../utils/executor-utils");
async function* vitestExecutor(options, context) {
    const projectRoot = context.projectsConfigurations.projects[context.projectName].root;
    (0, internal_1.registerTsConfigPaths)((0, path_1.resolve)(devkit_1.workspaceRoot, projectRoot, 'tsconfig.json'));
    process.env.VITE_CJS_IGNORE_WARNING = 'true';
    // Allows ESM to be required in CJS modules. Vite will be published as ESM in the future.
    const { startVitest } = await (0, executor_utils_1.loadVitestDynamicImport)();
    const resolvedOptions = (await (0, utils_1.getOptions)(options, context, projectRoot)) ?? {};
    const watch = resolvedOptions['watch'] === true;
    const nxReporter = new nx_reporter_1.NxReporter(watch);
    if (resolvedOptions['reporters'] === undefined) {
        resolvedOptions['reporters'] = [];
    }
    else if (typeof resolvedOptions['reporters'] === 'string') {
        resolvedOptions['reporters'] = [resolvedOptions['reporters']];
    }
    resolvedOptions['reporters'].push(nxReporter);
    const cliFilters = options.testFiles ?? [];
    const ctx = await startVitest(options.runMode ?? 'test', cliFilters, resolvedOptions);
    let hasErrors = false;
    const processExit = () => {
        ctx.exit();
        if (hasErrors) {
            process.exit(1);
        }
        else {
            process.exit(0);
        }
    };
    if (watch) {
        process.on('SIGINT', processExit);
        process.on('SIGTERM', processExit);
        process.on('exit', processExit);
    }
    // vitest sets the exitCode in case of exception without notifying reporters
    if (process.exitCode === undefined ||
        (watch && ctx.state.getFiles().length > 0)) {
        for await (const report of nxReporter) {
            // vitest sets the exitCode = 1 when code coverage isn't met
            hasErrors =
                report.hasErrors || (process.exitCode && process.exitCode !== 0);
        }
    }
    else {
        hasErrors = process.exitCode !== 0;
    }
    return {
        success: !hasErrors,
    };
}
exports.default = vitestExecutor;
