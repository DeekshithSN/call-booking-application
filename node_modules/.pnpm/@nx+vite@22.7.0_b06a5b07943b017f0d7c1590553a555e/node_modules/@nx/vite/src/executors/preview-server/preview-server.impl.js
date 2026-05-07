"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.vitePreviewServerExecutor = vitePreviewServerExecutor;
const devkit_1 = require("@nx/devkit");
const options_utils_1 = require("../../utils/options-utils");
const path_1 = require("path");
const build_impl_1 = require("../build/build.impl");
const executor_utils_1 = require("../../utils/executor-utils");
async function* vitePreviewServerExecutor(options, context) {
    process.env.VITE_CJS_IGNORE_WARNING = 'true';
    // Allows ESM to be required in CJS modules. Vite will be published as ESM in the future.
    const { mergeConfig, preview, resolveConfig } = await (0, executor_utils_1.loadViteDynamicImport)();
    const projectRoot = context.projectsConfigurations.projects[context.projectName].root;
    const target = (0, devkit_1.parseTargetString)(options.buildTarget, context);
    const targetConfiguration = context.projectsConfigurations.projects[target.project]?.targets[target.target];
    if (!targetConfiguration) {
        throw new Error(`Invalid buildTarget: ${options.buildTarget}`);
    }
    const isCustomBuildTarget = targetConfiguration.executor !== '@nx/vite:build' &&
        targetConfiguration.executor !== '@nrwl/vite:build';
    // Retrieve the option for the configured buildTarget.
    const buildTargetOptions = (0, options_utils_1.getNxTargetOptions)(options.buildTarget, context);
    const { configuration } = (0, devkit_1.parseTargetString)(options.buildTarget, context);
    const viteConfigPath = (0, options_utils_1.normalizeViteConfigFilePath)(context.root, projectRoot, buildTargetOptions.configFile);
    const { buildOptions, otherOptions: otherOptionsFromBuild } = await (0, build_impl_1.getBuildExtraArgs)({
        ...buildTargetOptions,
        ...{
            // Enable watch mode by default for the build target.
            watch: options.watch ?? true,
        },
    });
    const { previewOptions, otherOptions } = await getExtraArgs(options, configuration, otherOptionsFromBuild);
    const defaultMode = otherOptions?.mode ?? otherOptionsFromBuild?.mode ?? 'production';
    const resolved = await resolveConfig({
        configFile: viteConfigPath,
        mode: defaultMode,
    }, 'build', defaultMode, process.env.NODE_ENV ?? defaultMode, true);
    const outDir = options.staticFilePath ??
        (0, devkit_1.joinPathFragments)((0, devkit_1.offsetFromRoot)(projectRoot), buildTargetOptions.outputPath) ??
        resolved?.build?.outDir;
    if (!outDir) {
        throw new Error(`Could not infer the "outputPath" or "outDir". It should be set in your vite.config.ts, or as a property of the "${options.buildTarget}" buildTarget or provided explicitly as a "staticFilePath" option.`);
    }
    const root = projectRoot === '.'
        ? process.cwd()
        : (0, path_1.relative)(context.cwd, (0, devkit_1.joinPathFragments)(context.root, projectRoot));
    // Merge the options from the build and preview-serve targets.
    // The latter takes precedence.
    const mergedOptions = {
        ...{ watch: {} },
        build: {
            outDir,
            ...(isCustomBuildTarget ? {} : buildOptions),
        },
        ...(isCustomBuildTarget ? {} : otherOptionsFromBuild),
        ...otherOptions,
        preview: {
            ...(0, options_utils_1.getProxyConfig)(context, otherOptions.proxyConfig),
            ...previewOptions,
        },
    };
    // vite InlineConfig
    const serverConfig = mergeConfig({
        // This should not be needed as it's going to be set in vite.config.ts
        // but leaving it here in case someone did not migrate correctly
        root: resolved.root ?? root,
        configFile: viteConfigPath,
    }, {
        ...mergedOptions,
    });
    if (serverConfig.mode === 'production') {
        console.warn('WARNING: preview is not meant to be run in production!');
    }
    // vite PreviewServer
    let server;
    const processOnExit = async () => {
        await closeServer(server);
    };
    process.once('SIGINT', processOnExit);
    process.once('SIGTERM', processOnExit);
    process.once('exit', processOnExit);
    // Launch the build target.
    // If customBuildTarget is set to true, do not provide any overrides to it
    const buildTargetOverrides = isCustomBuildTarget ? {} : mergedOptions;
    const build = await (0, devkit_1.runExecutor)(target, buildTargetOverrides, context);
    for await (const result of build) {
        if (result.success) {
            try {
                if (!server) {
                    server = await preview(serverConfig);
                }
                server.printUrls();
                const resolvedUrls = [
                    ...server.resolvedUrls.local,
                    ...server.resolvedUrls.network,
                ];
                yield {
                    success: true,
                    baseUrl: resolvedUrls[0] ?? '',
                };
            }
            catch (e) {
                console.error(e);
                yield {
                    success: false,
                    baseUrl: '',
                };
            }
        }
        else {
            yield {
                success: false,
                baseUrl: '',
            };
        }
    }
    await new Promise((resolve) => {
        process.once('SIGINT', () => resolve());
        process.once('SIGTERM', () => resolve());
        process.once('exit', () => resolve());
    });
}
function closeServer(server) {
    return new Promise((resolve) => {
        if (!server) {
            resolve();
        }
        else {
            const { httpServer } = server;
            if (httpServer['closeAllConnections']) {
                // https://github.com/vitejs/vite/pull/14834
                // closeAllConnections was added in Node v18.2.0
                // typically is "as http.Server" but no reason
                // to import http just for this
                httpServer.closeAllConnections();
            }
            httpServer.close(() => resolve());
        }
    });
}
exports.default = vitePreviewServerExecutor;
async function getExtraArgs(options, configuration, otherOptionsFromBuildTarget) {
    // support passing extra args to vite cli
    const schema = await Promise.resolve().then(() => __importStar(require('./schema.json')));
    const extraArgs = {};
    for (const key of Object.keys(options)) {
        if (!schema.properties[key]) {
            extraArgs[key] = options[key];
        }
    }
    const previewOptions = {};
    const previewSchemaKeys = [
        'port',
        'strictPort',
        'host',
        'https',
        'open',
        'proxy',
        'cors',
        'headers',
    ];
    let otherOptions = {};
    for (const key of Object.keys(extraArgs)) {
        if (previewSchemaKeys.includes(key)) {
            previewOptions[key] = extraArgs[key];
        }
        else {
            otherOptions[key] = extraArgs[key];
        }
    }
    if (configuration) {
        otherOptions = {
            ...otherOptions,
            ...(otherOptionsFromBuildTarget ?? {}),
        };
    }
    return {
        previewOptions,
        otherOptions,
    };
}
