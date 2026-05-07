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
exports.viteBuildExecutor = viteBuildExecutor;
exports.getBuildExtraArgs = getBuildExtraArgs;
const devkit_1 = require("@nx/devkit");
const options_utils_1 = require("../../utils/options-utils");
const js_1 = require("@nx/js");
const fs_1 = require("fs");
const path_1 = require("path");
const async_iterable_1 = require("@nx/devkit/src/utils/async-iterable");
const executor_utils_1 = require("../../utils/executor-utils");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
async function* viteBuildExecutor(options, context) {
    process.env.VITE_CJS_IGNORE_WARNING = 'true';
    // Allows ESM to be required in CJS modules. Vite will be published as ESM in the future.
    const { mergeConfig, build, resolveConfig, createBuilder } = await (0, executor_utils_1.loadViteDynamicImport)();
    const projectRoot = context.projectsConfigurations.projects[context.projectName].root;
    const tsConfigForBuild = (0, executor_utils_1.createBuildableTsConfig)(projectRoot, options, context);
    const viteConfigPath = (0, options_utils_1.normalizeViteConfigFilePath)(context.root, projectRoot, options.configFile);
    const root = projectRoot === '.' || projectRoot === ''
        ? process.cwd()
        : (0, path_1.relative)(context.cwd, (0, devkit_1.joinPathFragments)(context.root, projectRoot));
    const { buildOptions, otherOptions } = await getBuildExtraArgs(options);
    const defaultMode = otherOptions?.mode ?? 'production';
    const resolved = await resolveConfig({
        configFile: viteConfigPath,
        mode: defaultMode,
    }, 'build', defaultMode, process.env.NODE_ENV ?? defaultMode);
    const outDir = (0, devkit_1.joinPathFragments)((0, devkit_1.offsetFromRoot)(projectRoot), options.outputPath) ??
        resolved?.build?.outDir;
    const buildConfig = mergeConfig({
        // This should not be needed as it's going to be set in vite.config.ts
        // but leaving it here in case someone did not migrate correctly
        root: resolved.root ?? root,
        configFile: viteConfigPath,
    }, {
        build: {
            outDir,
            ...buildOptions,
        },
        ...otherOptions,
    });
    // New TS Solution already has a typecheck target
    if (!options.skipTypeCheck && !(0, ts_solution_setup_1.isUsingTsSolutionSetup)()) {
        await (0, executor_utils_1.validateTypes)({
            workspaceRoot: context.root,
            tsconfig: tsConfigForBuild,
            isVueProject: Boolean(resolved.plugins?.find((plugin) => typeof plugin === 'object' && plugin?.name === 'vite:vue')),
        });
    }
    const builder = createBuilder !== undefined && options.useEnvironmentsApi
        ? await createBuilder(buildConfig)
        : // This is needed to ensure support for Vite 5
            {
                build: (inlineConfig) => build(inlineConfig),
                environments: { build: buildConfig },
            };
    let iterables = [];
    for (const env of Object.values(builder.environments)) {
        // Overwrite the resolved build config with executor options (e.g. outDir).
        // Skip when using the builder API (Vite 8+) as the builder already
        // resolves environment configs correctly and overwriting would clobber
        // environment-specific options like rollupOptions/rolldownOptions.
        if (env.config?.build && !options.useEnvironmentsApi) {
            env.config.build = {
                ...env.config.build,
                ...buildConfig.build,
            };
        }
        const watcherOrOutput = await builder.build(env);
        const libraryPackageJson = (0, path_1.resolve)(projectRoot, 'package.json');
        const rootPackageJson = (0, path_1.resolve)(context.root, 'package.json');
        // Here, we want the outdir relative to the workspace root.
        // So, we calculate the relative path from the workspace root to the outdir.
        const absoluteOutDir = (0, path_1.resolve)((0, path_1.resolve)(context.root, projectRoot), outDir);
        const outDirRelativeToWorkspaceRoot = (0, path_1.relative)(context.root, absoluteOutDir);
        const distPackageJson = (0, path_1.resolve)(outDirRelativeToWorkspaceRoot, 'package.json');
        // Generate a package.json if option has been set.
        if (options.generatePackageJson) {
            if (context.projectGraph.nodes[context.projectName].type !== 'app') {
                devkit_1.logger.warn((0, devkit_1.stripIndents) `The project ${context.projectName} is using the 'generatePackageJson' option which is deprecated for library projects. It should only be used for applications.
        For libraries, configure the project to use the '@nx/dependency-checks' ESLint rule instead (https://nx.dev/nx-api/eslint-plugin/documents/dependency-checks).`);
            }
            const builtPackageJson = (0, js_1.createPackageJson)(context.projectName, context.projectGraph, {
                target: context.targetName,
                root: context.root,
                isProduction: !options.includeDevDependenciesInPackageJson, // By default we remove devDependencies since this is a production build.
                skipOverrides: options.skipOverrides,
                skipPackageManager: options.skipPackageManager,
            });
            builtPackageJson.type ??= 'module';
            (0, devkit_1.writeJsonFile)(`${outDirRelativeToWorkspaceRoot}/package.json`, builtPackageJson);
            const packageManager = (0, devkit_1.detectPackageManager)(context.root);
            if (packageManager === 'bun') {
                devkit_1.logger.warn('Bun lockfile generation is not supported. The generated package.json will not include a lockfile. Run "bun install" in the output directory after deployment if needed.');
            }
            else {
                const lockFile = (0, js_1.createLockFile)(builtPackageJson, context.projectGraph, packageManager);
                (0, fs_1.writeFileSync)(`${outDirRelativeToWorkspaceRoot}/${(0, js_1.getLockFileName)(packageManager)}`, lockFile, {
                    encoding: 'utf-8',
                });
            }
        }
        // For buildable libs, copy package.json if it exists.
        else if (options.generatePackageJson !== false &&
            !(0, fs_1.existsSync)(distPackageJson) &&
            (0, fs_1.existsSync)(libraryPackageJson) &&
            rootPackageJson !== libraryPackageJson) {
            await (0, js_1.copyAssets)({
                outputPath: outDirRelativeToWorkspaceRoot,
                assets: [
                    {
                        input: projectRoot,
                        output: '.',
                        glob: 'package.json',
                    },
                ],
            }, context);
        }
        const iterable = (0, async_iterable_1.createAsyncIterable)(({ next, done }) => {
            if ('on' in watcherOrOutput) {
                let success = true;
                watcherOrOutput.on('event', (event) => {
                    if (event.code === 'START') {
                        success = true;
                    }
                    else if (event.code === 'ERROR') {
                        success = false;
                    }
                    else if (event.code === 'END') {
                        next({ success });
                    }
                    // result must be closed when present.
                    // see https://rollupjs.org/guide/en/#rollupwatch
                    if ('result' in event && event.result) {
                        event.result.close();
                    }
                });
            }
            else {
                const output = watcherOrOutput?.['output'] || watcherOrOutput?.[0]?.output;
                const fileName = output?.[0]?.fileName || 'main.cjs';
                const outfile = (0, path_1.resolve)(outDirRelativeToWorkspaceRoot, fileName);
                next({ success: true, outfile });
                done();
            }
        });
        iterables.push(iterable);
    }
    return yield* (0, async_iterable_1.combineAsyncIterables)(iterables.shift(), ...(iterables ?? []));
}
async function getBuildExtraArgs(options) {
    // support passing extra args to vite cli
    const schema = await Promise.resolve().then(() => __importStar(require('./schema.json')));
    const extraArgs = {};
    for (const key of Object.keys(options)) {
        if (!schema.properties[key]) {
            extraArgs[key] = options[key];
        }
    }
    const buildOptions = {};
    const buildSchemaKeys = [
        'target',
        'polyfillModulePreload',
        'modulePreload',
        'outDir',
        'assetsDir',
        'assetsInlineLimit',
        'cssCodeSplit',
        'cssTarget',
        'cssMinify',
        'sourcemap',
        'minify',
        'terserOptions',
        'rollupOptions',
        'rolldownOptions',
        'commonjsOptions',
        'dynamicImportVarsOptions',
        'write',
        'emptyOutDir',
        'copyPublicDir',
        'manifest',
        'lib',
        'ssr',
        'ssrManifest',
        'ssrEmitAssets',
        'reportCompressedSize',
        'chunkSizeWarningLimit',
        'watch',
    ];
    const otherOptions = {};
    for (const key of Object.keys(extraArgs)) {
        if (buildSchemaKeys.includes(key)) {
            buildOptions[key] = extraArgs[key];
        }
        else {
            otherOptions[key] = extraArgs[key];
        }
    }
    buildOptions['watch'] = options.watch ?? undefined;
    return {
        buildOptions,
        otherOptions,
    };
}
exports.default = viteBuildExecutor;
