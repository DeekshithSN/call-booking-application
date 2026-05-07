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
exports.viteDevServerExecutor = viteDevServerExecutor;
const devkit_1 = require("@nx/devkit");
const options_utils_1 = require("../../utils/options-utils");
const executor_utils_1 = require("../../utils/executor-utils");
const path_1 = require("path");
const build_impl_1 = require("../build/build.impl");
async function* viteDevServerExecutor(options, context) {
    process.env.VITE_CJS_IGNORE_WARNING = 'true';
    // Allows ESM to be required in CJS modules. Vite will be published as ESM in the future.
    const { mergeConfig, createServer, resolveConfig } = await (0, executor_utils_1.loadViteDynamicImport)();
    const projectRoot = context.projectsConfigurations.projects[context.projectName].root;
    const root = projectRoot === '.'
        ? process.cwd()
        : (0, path_1.relative)(context.cwd, (0, devkit_1.joinPathFragments)(context.root, projectRoot));
    (0, executor_utils_1.createBuildableTsConfig)(projectRoot, options, context);
    // Retrieve the option for the configured buildTarget.
    const buildTargetOptions = (0, options_utils_1.getNxTargetOptions)(options.buildTarget, context);
    const { configuration } = (0, devkit_1.parseTargetString)(options.buildTarget, context);
    const { buildOptions, otherOptions: otherOptionsFromBuild } = await (0, build_impl_1.getBuildExtraArgs)(buildTargetOptions);
    const viteConfigPath = (0, options_utils_1.normalizeViteConfigFilePath)(context.root, projectRoot, buildTargetOptions.configFile);
    const { serverOptions, otherOptions } = await getServerExtraArgs(options, configuration, buildOptions, otherOptionsFromBuild);
    const defaultMode = otherOptions?.mode ?? buildTargetOptions?.['mode'] ?? 'development';
    const resolved = await resolveConfig({
        configFile: viteConfigPath,
        mode: defaultMode,
    }, 'serve', defaultMode, process.env.NODE_ENV ?? defaultMode);
    // vite InlineConfig
    const serverConfig = mergeConfig({
        // This should not be needed as it's going to be set in vite.config.ts
        // but leaving it here in case someone did not migrate correctly
        root: resolved.root ?? root,
        configFile: viteConfigPath,
    }, {
        server: {
            ...(await (0, options_utils_1.getViteServerOptions)(options, context)),
            ...serverOptions,
        },
        ...otherOptions,
    });
    try {
        const server = await createServer(serverConfig);
        await runViteDevServer(server);
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
    await new Promise((resolve) => {
        process.once('SIGINT', () => resolve());
        process.once('SIGTERM', () => resolve());
        process.once('exit', () => resolve());
    });
}
// vite ViteDevServer
async function runViteDevServer(server) {
    await server.listen();
    server.printUrls();
    const processOnExit = async () => {
        await server.close();
    };
    process.once('SIGINT', processOnExit);
    process.once('SIGTERM', processOnExit);
    process.once('exit', processOnExit);
}
exports.default = viteDevServerExecutor;
async function getServerExtraArgs(options, configuration, buildOptionsFromBuildTarget, otherOptionsFromBuildTarget) {
    // support passing extra args to vite cli
    const schema = await Promise.resolve().then(() => __importStar(require('./schema.json')));
    const extraArgs = {};
    for (const key of Object.keys(options)) {
        if (!schema.properties[key]) {
            extraArgs[key] = options[key];
        }
    }
    let serverOptions = {};
    const serverSchemaKeys = [
        'hmr',
        'warmup',
        'watch',
        'middlewareMode',
        'fs',
        'origin',
        'preTransformRequests',
        'sourcemapIgnoreList',
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
        if (serverSchemaKeys.includes(key)) {
            serverOptions[key] = extraArgs[key];
        }
        else {
            otherOptions[key] = extraArgs[key];
        }
    }
    if (configuration) {
        serverOptions = {
            ...serverOptions,
            watch: buildOptionsFromBuildTarget?.watch ?? serverOptions?.watch,
        };
        otherOptions = {
            ...otherOptions,
            ...(otherOptionsFromBuildTarget ?? {}),
        };
    }
    return {
        serverOptions,
        otherOptions,
    };
}
