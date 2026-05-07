"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToInferred = convertToInferred;
const devkit_1 = require("@nx/devkit");
const executor_to_plugin_migrator_1 = require("@nx/devkit/src/generators/plugin-migrations/executor-to-plugin-migrator");
const plugin_1 = require("../../plugins/plugin");
const build_post_target_transformer_1 = require("./lib/build-post-target-transformer");
const serve_post_target_transformer_1 = require("./lib/serve-post-target-transformer");
const preview_post_target_transformer_1 = require("./lib/preview-post-target-transformer");
const test_post_target_transformer_1 = require("./lib/test-post-target-transformer");
const aggregate_log_util_1 = require("@nx/devkit/src/generators/plugin-migrations/aggregate-log-util");
async function convertToInferred(tree, options) {
    const projectGraph = await (0, devkit_1.createProjectGraphAsync)();
    const migrationLogs = new aggregate_log_util_1.AggregatedLog();
    const migratedProjects = await (0, executor_to_plugin_migrator_1.migrateProjectExecutorsToPlugin)(tree, projectGraph, '@nx/vite/plugin', plugin_1.createNodesV2, {
        buildTargetName: 'build',
        serveTargetName: 'serve',
        previewTargetName: 'preview',
        testTargetName: 'test',
        serveStaticTargetName: 'serve-static',
    }, [
        {
            executors: ['@nx/vite:build'],
            postTargetTransformer: build_post_target_transformer_1.buildPostTargetTransformer,
            targetPluginOptionMapper: (target) => ({ buildTargetName: target }),
        },
        {
            executors: ['@nx/vite:dev-server'],
            postTargetTransformer: (0, serve_post_target_transformer_1.servePostTargetTransformer)(migrationLogs),
            targetPluginOptionMapper: (target) => ({ serveTargetName: target }),
        },
        {
            executors: ['@nx/vite:preview-server'],
            postTargetTransformer: (0, preview_post_target_transformer_1.previewPostTargetTransformer)(migrationLogs),
            targetPluginOptionMapper: (target) => ({ previewTargetName: target }),
        },
        {
            executors: ['@nx/vite:test'],
            postTargetTransformer: test_post_target_transformer_1.testPostTargetTransformer,
            targetPluginOptionMapper: (target) => ({ testTargetName: target }),
        },
    ], options.project);
    if (migratedProjects.size === 0) {
        throw new executor_to_plugin_migrator_1.NoTargetsToMigrateError();
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return () => {
        migrationLogs.flushLogs();
    };
}
exports.default = convertToInferred;
