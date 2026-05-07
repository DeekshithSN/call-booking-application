"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodes = exports.createNodesV2 = exports.PLUGIN_NAME = exports.createDependencies = void 0;
const devkit_1 = require("@nx/devkit");
const get_named_inputs_1 = require("@nx/devkit/src/utils/get-named-inputs");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const file_hasher_1 = require("nx/src/hasher/file-hasher");
const picomatch = require("picomatch");
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
const lock_file_1 = require("nx/src/plugins/js/lock-file/lock-file");
const cache_directory_1 = require("nx/src/utils/cache-directory");
const util_1 = require("./util");
let ts;
const TSCONFIG_CACHE_VERSION = 2;
const TS_CONFIG_CACHE_PATH = (0, node_path_1.join)(cache_directory_1.workspaceDataDirectory, 'tsconfig-files.hash');
// Module-level cache store — each invocation gets a unique Symbol key
const cacheStore = new Map();
// Shared tsconfig cache — initialized once per batch, persisted to disk
let tsConfigCacheData = {};
let tsConfigCacheInitialized = false;
function readFromCache(cachePath) {
    try {
        return process.env.NX_CACHE_PROJECT_GRAPH !== 'false'
            ? (0, devkit_1.readJsonFile)(cachePath)
            : {};
    }
    catch {
        return {};
    }
}
function readTsConfigCacheData() {
    const cache = readFromCache(TS_CONFIG_CACHE_PATH);
    if (cache.version !== TSCONFIG_CACHE_VERSION) {
        return {};
    }
    return cache.data;
}
function writeToCache(cachePath, data) {
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const unique = (Math.random().toString(16) + '00000000').slice(2, 10);
        const tempPath = `${cachePath}.${process.pid}.${unique}.tmp`;
        try {
            (0, devkit_1.writeJsonFile)(tempPath, data, { spaces: 0 });
            (0, node_fs_1.renameSync)(tempPath, cachePath);
            return;
        }
        catch {
            try {
                (0, node_fs_1.unlinkSync)(tempPath);
            }
            catch { }
        }
    }
}
function writeTsConfigCache(data) {
    writeToCache(TS_CONFIG_CACHE_PATH, {
        version: TSCONFIG_CACHE_VERSION,
        data,
    });
}
function createConfigContext(configFilePath, workspaceRoot, projectContext) {
    const absolutePath = (0, node_path_1.join)(workspaceRoot, configFilePath);
    return {
        originalPath: configFilePath,
        absolutePath,
        relativePath: posixRelative(workspaceRoot, absolutePath),
        basename: (0, node_path_1.basename)(configFilePath),
        basenameNoExt: (0, node_path_1.basename)(configFilePath, '.json'),
        dirname: (0, node_path_1.dirname)(absolutePath),
        project: projectContext,
    };
}
function getConfigContext(configPath, workspaceRoot, cache) {
    const absolutePath = configPath.startsWith('/') || configPath.startsWith(workspaceRoot)
        ? (0, node_path_1.normalize)(configPath)
        : (0, node_path_1.join)(workspaceRoot, configPath);
    let context = cache.configContexts.get(absolutePath);
    if (context) {
        return context;
    }
    const relativePath = (0, node_path_1.relative)(workspaceRoot, absolutePath);
    const projectRoot = (0, node_path_1.dirname)(relativePath);
    if (!cache.projectContexts.has(projectRoot)) {
        cache.projectContexts.set(projectRoot, {
            root: projectRoot,
            normalized: (0, devkit_1.normalizePath)(projectRoot),
            absolute: (0, node_path_1.join)(workspaceRoot, projectRoot),
        });
    }
    const newContext = createConfigContext(relativePath, workspaceRoot, cache.projectContexts.get(projectRoot));
    cache.configContexts.set(absolutePath, newContext);
    return newContext;
}
/**
 * @deprecated The 'createDependencies' function is now a no-op. This functionality is included in 'createNodesV2'.
 */
const createDependencies = () => {
    return [];
};
exports.createDependencies = createDependencies;
exports.PLUGIN_NAME = '@nx/js/typescript';
const tsConfigGlob = '**/tsconfig*.json';
exports.createNodesV2 = [
    tsConfigGlob,
    async (configFilePaths, options, context) => {
        const optionsHash = (0, file_hasher_1.hashObject)(options);
        const targetsCachePath = (0, node_path_1.join)(cache_directory_1.workspaceDataDirectory, `tsc-${optionsHash}.hash`);
        const targetsCache = readFromCache(targetsCachePath);
        // Each invocation gets a unique Symbol key — guaranteed no collisions
        const cacheKey = Symbol('tsc-invocation');
        cacheStore.set(cacheKey, {
            fileHashes: {},
            rawFiles: {},
            picomatchMatchers: {},
            extendedFilesHashes: new Map(),
            configOwners: new Map(),
            projectContexts: new Map(),
            configContexts: new Map(),
        });
        const cache = cacheStore.get(cacheKey);
        initializeTsConfigCache(configFilePaths, context.workspaceRoot, cache);
        const normalizedOptions = normalizePluginOptions(options);
        const pmc = (0, devkit_1.getPackageManagerCommand)((0, devkit_1.detectPackageManager)(context.workspaceRoot));
        const { configFilePaths: validConfigFilePaths, hashes, projectRoots, } = await resolveValidConfigFilesAndHashes(configFilePaths, normalizedOptions, optionsHash, context, cache);
        try {
            return await (0, devkit_1.createNodesFromFiles)((configFilePath, options, context, idx) => {
                const projectRoot = projectRoots[idx];
                const hash = hashes[idx];
                const targetsCacheKey = `${hash}_${configFilePath}`;
                const absolutePath = (0, node_path_1.join)(context.workspaceRoot, configFilePath);
                const configContext = getConfigContext(absolutePath, context.workspaceRoot, cache);
                targetsCache[targetsCacheKey] ??= buildTscTargets(configContext, options, context, validConfigFilePaths, cache, pmc);
                const { targets } = targetsCache[targetsCacheKey];
                return {
                    projects: {
                        [projectRoot]: {
                            targets,
                        },
                    },
                };
            }, validConfigFilePaths, normalizedOptions, context);
        }
        finally {
            writeToCache(targetsCachePath, targetsCache);
            writeTsConfigCache(toRelativePaths(tsConfigCacheData, context.workspaceRoot));
            // Delete this invocation's cache — unique Symbol means no cross-invocation impact
            cacheStore.delete(cacheKey);
            // Reset shared tsconfig cache when all invocations are done
            if (cacheStore.size === 0) {
                tsConfigCacheData = {};
                tsConfigCacheInitialized = false;
            }
        }
    },
];
exports.createNodes = exports.createNodesV2;
async function resolveValidConfigFilesAndHashes(configFilePaths, options, optionsHash, context, cache) {
    const lockFileHash = (0, file_hasher_1.hashFile)((0, node_path_1.join)(context.workspaceRoot, (0, lock_file_1.getLockFileName)((0, devkit_1.detectPackageManager)(context.workspaceRoot)))) ?? '';
    const validConfigFilePaths = [];
    const hashes = [];
    const projectRoots = [];
    for await (const configFilePath of configFilePaths) {
        const projectRoot = (0, node_path_1.dirname)(configFilePath);
        const absolutePath = (0, node_path_1.join)(context.workspaceRoot, configFilePath);
        const configContext = getConfigContext(absolutePath, context.workspaceRoot, cache);
        // Skip configs that can't produce any targets based on plugin options
        const isTypecheckConfig = configContext.basename ===
            (options.typecheck ? options.typecheck.configName : 'tsconfig.json');
        const isBuildConfig = options.build && configContext.basename === options.build.configName;
        if (!isTypecheckConfig && !isBuildConfig) {
            continue;
        }
        if (!checkIfConfigFileShouldBeProject(configContext, cache)) {
            continue;
        }
        projectRoots.push(projectRoot);
        validConfigFilePaths.push(configFilePath);
        hashes.push(await getConfigFileHash(configFilePath, context.workspaceRoot, configContext.project, optionsHash, lockFileHash, cache));
    }
    return { configFilePaths: validConfigFilePaths, hashes, projectRoots };
}
/**
 * The cache key is composed by:
 * - hashes of the content of the relevant files that can affect what's inferred by the plugin:
 *   - current config file
 *   - config files extended by the current config file (recursively up to the root config file)
 *   - referenced config files that are internal to the owning Nx project of the current config file,
 *     or is a shallow external reference of the owning Nx project
 *   - lock file
 *   - project's package.json
 * - hash of the plugin options
 * - current config file path
 */
async function getConfigFileHash(configFilePath, workspaceRoot, project, optionsHash, lockFileHash, cache) {
    const fullConfigPath = (0, node_path_1.join)(workspaceRoot, configFilePath);
    const tsConfig = retrieveTsConfigFromCache(fullConfigPath, workspaceRoot, cache);
    const extendedConfigFiles = getExtendedConfigFiles(tsConfig, workspaceRoot, cache);
    const internalReferencedFiles = resolveInternalProjectReferences(tsConfig, workspaceRoot, project, cache);
    const externalProjectReferences = resolveShallowExternalProjectReferences(tsConfig, workspaceRoot, project, cache);
    let packageJson = null;
    try {
        packageJson = (0, devkit_1.readJsonFile)((0, node_path_1.join)(workspaceRoot, project.root, 'package.json'));
    }
    catch { }
    return (0, file_hasher_1.hashArray)([
        ...[
            fullConfigPath,
            ...extendedConfigFiles.files.sort(),
            ...Object.keys(internalReferencedFiles).sort(),
            ...Object.keys(externalProjectReferences).sort(),
        ].map((file) => getFileHash(file, workspaceRoot, cache)),
        ...extendedConfigFiles.packages.sort(),
        lockFileHash,
        optionsHash,
        ...(packageJson ? [(0, file_hasher_1.hashObject)(packageJson)] : []),
    ]);
}
function checkIfConfigFileShouldBeProject(config, cache) {
    // Do not create a project for the workspace root tsconfig files.
    if (config.project.root === '.') {
        return false;
    }
    // Do not create a project if package.json and project.json isn't there.
    const siblingFiles = (0, node_fs_1.readdirSync)(config.project.absolute);
    if (!siblingFiles.includes('package.json') &&
        !siblingFiles.includes('project.json')) {
        return false;
    }
    cache.configOwners.set(config.relativePath, config.project.normalized);
    // Do not create a project if it's not a tsconfig.json and there is no tsconfig.json in the same directory
    if (config.basename !== 'tsconfig.json' &&
        !siblingFiles.includes('tsconfig.json')) {
        return false;
    }
    // Do not create project for Next.js projects since they are not compatible with
    // project references and typecheck will fail.
    if (siblingFiles.includes('next.config.js') ||
        siblingFiles.includes('next.config.cjs') ||
        siblingFiles.includes('next.config.mjs') ||
        siblingFiles.includes('next.config.ts')) {
        return false;
    }
    return true;
}
function buildTscTargets(config, options, context, configFiles, cache, pmc) {
    const targets = {};
    const namedInputs = (0, get_named_inputs_1.getNamedInputs)(config.project.root, context);
    const tsConfig = retrieveTsConfigFromCache(config.absolutePath, context.workspaceRoot, cache);
    let internalProjectReferences;
    if (options.typecheck &&
        config.basename === options.typecheck.configName &&
        tsConfig.raw?.['nx']?.addTypecheckTarget !== false) {
        internalProjectReferences = resolveInternalProjectReferences(tsConfig, context.workspaceRoot, config.project, cache);
        const externalProjectReferences = resolveShallowExternalProjectReferences(tsConfig, context.workspaceRoot, config.project, cache);
        const targetName = options.typecheck.targetName;
        const compiler = options.compiler;
        if (!targets[targetName]) {
            let command = `${compiler} --build ${options.typecheck.configName} --emitDeclarationOnly${options.verboseOutput ? ' --verbose' : ''}`;
            if (tsConfig.options.noEmit ||
                Object.values(internalProjectReferences).some((ref) => ref.options.noEmit) ||
                Object.values(externalProjectReferences).some((ref) => ref.options.noEmit)) {
                // `tsc --build` does not work with `noEmit: true`
                command = `echo "The 'typecheck' target is disabled because one or more project references set 'noEmit: true' in their tsconfig. Remove this property to resolve this issue."`;
            }
            const dependsOn = [`^${targetName}`];
            if (options.build && targets[options.build.targetName]) {
                // we already processed and have a build target
                dependsOn.unshift(options.build.targetName);
            }
            else if (options.build) {
                // check if the project will have a build target
                const buildConfigPath = (0, devkit_1.joinPathFragments)(config.project.root, options.build.configName);
                if (configFiles.some((f) => f === buildConfigPath) &&
                    (options.build.skipBuildCheck ||
                        (0, util_1.isValidPackageJsonBuildConfig)(retrieveTsConfigFromCache(buildConfigPath, context.workspaceRoot, cache), context.workspaceRoot, config.project.root))) {
                    dependsOn.unshift(options.build.targetName);
                }
            }
            targets[targetName] = {
                dependsOn,
                command,
                options: { cwd: config.project.normalized },
                cache: true,
                inputs: getInputs(namedInputs, config, tsConfig, internalProjectReferences, context.workspaceRoot, cache),
                outputs: getOutputs(config, tsConfig, internalProjectReferences, context.workspaceRoot, 
                /* emitDeclarationOnly */ true),
                syncGenerators: ['@nx/js:typescript-sync'],
                metadata: {
                    technologies: ['typescript'],
                    description: 'Runs type-checking for the project.',
                    help: {
                        command: `${pmc.exec} ${compiler} --build --help`,
                        example: {
                            args: ['--force'],
                        },
                    },
                },
            };
        }
    }
    // Build target
    if (options.build &&
        config.basename === options.build.configName &&
        (options.build.skipBuildCheck ||
            (0, util_1.isValidPackageJsonBuildConfig)(tsConfig, context.workspaceRoot, config.project.root))) {
        internalProjectReferences ??= resolveInternalProjectReferences(tsConfig, context.workspaceRoot, config.project, cache);
        const targetName = options.build.targetName;
        const compiler = options.compiler;
        targets[targetName] = {
            dependsOn: [`^${targetName}`],
            command: `${compiler} --build ${options.build.configName}${options.verboseOutput ? ' --verbose' : ''}`,
            options: { cwd: config.project.normalized },
            cache: true,
            inputs: getInputs(namedInputs, config, tsConfig, internalProjectReferences, context.workspaceRoot, cache),
            outputs: getOutputs(config, tsConfig, internalProjectReferences, context.workspaceRoot, 
            // should be false for build target, but providing it just in case is set to true
            tsConfig.options.emitDeclarationOnly),
            syncGenerators: ['@nx/js:typescript-sync'],
            metadata: {
                technologies: ['typescript'],
                description: 'Builds the project with `tsc`.',
                help: {
                    command: `${pmc.exec} ${compiler} --build --help`,
                    example: {
                        args: ['--force'],
                    },
                },
            },
        };
        (0, util_1.addBuildAndWatchDepsTargets)(context.workspaceRoot, config.project.root, targets, {
            buildDepsTargetName: options.build.buildDepsName,
            watchDepsTargetName: options.build.watchDepsName,
        }, pmc);
    }
    return { targets };
}
function getInputs(namedInputs, config, tsConfig, internalProjectReferences, workspaceRoot, cache) {
    const configFiles = new Set();
    // TODO(leo): temporary disable external dependencies until we support hashing
    // glob patterns from external dependencies
    // const externalDependencies = ['typescript'];
    const extendedConfigFiles = getExtendedConfigFiles(tsConfig, workspaceRoot, cache);
    extendedConfigFiles.files.forEach((configPath) => {
        configFiles.add(configPath);
    });
    // externalDependencies.push(...extendedConfigFiles.packages);
    const includePaths = new Set();
    const excludePaths = new Set();
    const projectTsConfigFiles = [
        [config.originalPath, tsConfig],
        ...Object.entries(internalProjectReferences),
    ];
    const absoluteProjectRoot = config.project.absolute;
    if (!ts) {
        ts = require('typescript');
    }
    // https://github.com/microsoft/TypeScript/blob/19b777260b26aac5707b1efd34202054164d4a9d/src/compiler/utilities.ts#L9869
    const supportedTSExtensions = [
        ts.Extension.Ts,
        ts.Extension.Tsx,
        ts.Extension.Dts,
        ts.Extension.Cts,
        ts.Extension.Dcts,
        ts.Extension.Mts,
        ts.Extension.Dmts,
    ];
    // https://github.com/microsoft/TypeScript/blob/19b777260b26aac5707b1efd34202054164d4a9d/src/compiler/utilities.ts#L9878
    const allSupportedExtensions = [
        ts.Extension.Ts,
        ts.Extension.Tsx,
        ts.Extension.Dts,
        ts.Extension.Js,
        ts.Extension.Jsx,
        ts.Extension.Cts,
        ts.Extension.Dcts,
        ts.Extension.Cjs,
        ts.Extension.Mts,
        ts.Extension.Dmts,
        ts.Extension.Mjs,
    ];
    const normalizeInput = (input, config) => {
        const extensions = config.options.allowJs
            ? [...allSupportedExtensions]
            : [...supportedTSExtensions];
        if (config.options.resolveJsonModule) {
            extensions.push(ts.Extension.Json);
        }
        const segments = input.split('/');
        // An "includes" path "foo" is implicitly a glob "foo/**/*" if its last
        // segment has no extension, and does not contain any glob characters
        // itself.
        // https://github.com/microsoft/TypeScript/blob/19b777260b26aac5707b1efd34202054164d4a9d/src/compiler/utilities.ts#L9577-L9585
        if (!/[.*?]/.test(segments.at(-1))) {
            return extensions.map((ext) => `${segments.join('/')}/**/*${ext}`);
        }
        return [input];
    };
    const configDirTemplate = '${configDir}';
    const substituteConfigDir = (p) => p.startsWith(configDirTemplate) ? p.replace(configDirTemplate, './') : p;
    // Helper function to get or create cached picomatch matchers
    const getOrCreateMatcher = (pattern) => {
        if (!cache.picomatchMatchers[pattern]) {
            cache.picomatchMatchers[pattern] = picomatch(pattern);
        }
        return cache.picomatchMatchers[pattern];
    };
    projectTsConfigFiles.forEach(([configPath, tsconfig]) => {
        configFiles.add(configPath);
        const offset = (0, node_path_1.relative)(absoluteProjectRoot, (0, node_path_1.dirname)(configPath));
        (tsconfig.raw?.include ?? []).forEach((p) => {
            const normalized = normalizeInput((0, node_path_1.join)(offset, substituteConfigDir(p)), tsconfig);
            normalized.forEach((input) => includePaths.add(input));
        });
        if (tsconfig.raw?.exclude) {
            /**
             * We need to filter out the exclude paths that are already included in
             * other tsconfig files. If they are not included in other tsconfig files,
             * they still correctly apply to the current file and we should keep them.
             */
            const otherFilesInclude = [];
            projectTsConfigFiles.forEach(([path, c]) => {
                if (path !== configPath) {
                    otherFilesInclude.push(...(c.raw?.include ?? []).map(substituteConfigDir));
                }
            });
            const normalize = (p) => (p.startsWith('./') ? p.slice(2) : p);
            tsconfig.raw.exclude.forEach((e) => {
                const excludePath = substituteConfigDir(e);
                const normalizedExclude = normalize(excludePath);
                const excludeMatcher = getOrCreateMatcher(normalizedExclude);
                if (!otherFilesInclude.some((includePath) => {
                    const normalizedInclude = normalize(includePath);
                    const includeMatcher = getOrCreateMatcher(normalizedInclude);
                    return (excludeMatcher(normalizedInclude) ||
                        includeMatcher(normalizedExclude));
                })) {
                    excludePaths.add(excludePath);
                }
            });
        }
    });
    const inputs = [];
    if (includePaths.size) {
        if ((0, node_fs_1.existsSync)((0, node_path_1.join)(workspaceRoot, config.project.root, 'package.json'))) {
            inputs.push('{projectRoot}/package.json');
        }
        inputs.push(...Array.from(configFiles).map((p) => pathToInputOrOutput(p, workspaceRoot, config.project)), ...Array.from(includePaths).map((p) => pathToInputOrOutput((0, devkit_1.joinPathFragments)(config.project.root, p), workspaceRoot, config.project)));
    }
    else {
        // If we couldn't identify any include paths, we default to the default
        // named inputs.
        inputs.push('production' in namedInputs ? 'production' : 'default');
    }
    if (excludePaths.size) {
        inputs.push(...Array.from(excludePaths).map((p) => `!${pathToInputOrOutput((0, devkit_1.joinPathFragments)(config.project.root, p), workspaceRoot, config.project)}`));
    }
    // tsc --build reads .d.ts/.d.cts/.d.mts and .tsbuildinfo files from dependent
    // tasks, not the source files of dependencies. This correctly tracks build
    // outputs from both external project references and same-project task
    // dependencies (e.g. build-native producing .d.ts files that may be excluded
    // from file watching via .nxignore). Declaration files are also read from
    // the deps projects sources.
    inputs.push({
        dependentTasksOutputFiles: '**/*.{d.ts,d.cts,d.mts,tsbuildinfo}',
        transitive: true,
    });
    inputs.push({
        fileset: '{projectRoot}/**/*.{d.ts,d.cts,d.mts}',
        dependencies: true,
    });
    const externalRefPatterns = getExternalProjectReferenceTsconfigPatterns(tsConfig, internalProjectReferences, workspaceRoot, config.project, cache);
    inputs.push(...externalRefPatterns);
    // inputs.push({ externalDependencies });
    return inputs;
}
function getOutputs(config, rootTsConfig, internalProjectReferences, workspaceRoot, emitDeclarationOnly) {
    const outputs = new Set();
    // We could have more surgical outputs based on the tsconfig options, but the
    // user could override them through the command line and that wouldn't be
    // reflected in the outputs. So, we just include everything that could be
    // produced by the tsc command.
    [
        { configBaseNameNoExt: config.basenameNoExt, tsConfig: rootTsConfig },
        ...Object.entries(internalProjectReferences).map(([internalConfigPath, internalConfig]) => ({
            configBaseNameNoExt: (0, node_path_1.basename)(internalConfigPath, '.json'),
            tsConfig: internalConfig,
        })),
    ].forEach(({ configBaseNameNoExt, tsConfig }) => {
        if (tsConfig.options.outFile) {
            const outFileName = (0, node_path_1.basename)(tsConfig.options.outFile, '.js');
            const outFileDir = (0, node_path_1.dirname)(tsConfig.options.outFile);
            outputs.add(pathToInputOrOutput(tsConfig.options.outFile, workspaceRoot, config.project));
            // outFile is not be used with .cjs, .mjs, .jsx, so the list is simpler
            const outDir = (0, node_path_1.relative)(workspaceRoot, outFileDir);
            outputs.add(pathToInputOrOutput((0, devkit_1.joinPathFragments)(outDir, `${outFileName}.js.map`), workspaceRoot, config.project));
            outputs.add(pathToInputOrOutput((0, devkit_1.joinPathFragments)(outDir, `${outFileName}.d.ts`), workspaceRoot, config.project));
            outputs.add(pathToInputOrOutput((0, devkit_1.joinPathFragments)(outDir, `${outFileName}.d.ts.map`), workspaceRoot, config.project));
        }
        else if (tsConfig.options.outDir) {
            if (emitDeclarationOnly) {
                outputs.add(pathToInputOrOutput((0, devkit_1.joinPathFragments)(tsConfig.options.outDir, '**/*.{d.ts,d.cts,d.mts}'), workspaceRoot, config.project));
                if (tsConfig.options.declarationMap) {
                    outputs.add(pathToInputOrOutput((0, devkit_1.joinPathFragments)(tsConfig.options.outDir, '**/*.{d.ts,d.cts,d.mts}.map'), workspaceRoot, config.project));
                }
            }
            else {
                // List specific tsc output extensions instead of claiming the
                // entire outDir, so other tasks that write into the same
                // directory (e.g. copy-assets for .node/.wasm files) don't
                // have their outputs captured by the tsc build cache.
                const jsonExt = tsConfig.options.resolveJsonModule ? ',json' : '';
                outputs.add(pathToInputOrOutput((0, devkit_1.joinPathFragments)(tsConfig.options.outDir, `**/*.{js,cjs,mjs,jsx${jsonExt},d.ts,d.cts,d.mts}{,.map}`), workspaceRoot, config.project));
            }
        }
        else if (tsConfig.raw?.include?.length ||
            tsConfig.raw?.files?.length ||
            (!tsConfig.raw?.include && !tsConfig.raw?.files)) {
            // tsc produce files in place when no outDir or outFile is set
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.js'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.cjs'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.mjs'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.jsx'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.js.map')); // should also include .cjs and .mjs data
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.jsx.map'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.d.ts'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.d.cts'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.d.mts'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.d.ts.map'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.d.cts.map'));
            outputs.add((0, devkit_1.joinPathFragments)('{projectRoot}', '**/*.d.mts.map'));
        }
        // tsc --build always produces a tsbuildinfo file.
        outputs.add(getTsBuildInfoOutputPath(tsConfig, configBaseNameNoExt, workspaceRoot, config.project));
    });
    return Array.from(outputs);
}
/**
 * Returns the path to the tsbuildinfo file that tsc --build will produce.
 * tsc always emits this file in build mode (incremental is implicit).
 */
function getTsBuildInfoOutputPath(tsConfig, configBaseNameNoExt, workspaceRoot, project) {
    if (tsConfig.options.tsBuildInfoFile) {
        return pathToInputOrOutput(tsConfig.options.tsBuildInfoFile, workspaceRoot, project);
    }
    if (tsConfig.options.outFile) {
        const outFileName = (0, node_path_1.basename)(tsConfig.options.outFile, '.js');
        const outDir = (0, node_path_1.relative)(workspaceRoot, (0, node_path_1.dirname)(tsConfig.options.outFile));
        return pathToInputOrOutput((0, devkit_1.joinPathFragments)(outDir, `${outFileName}.tsbuildinfo`), workspaceRoot, project);
    }
    if (tsConfig.options.outDir) {
        return pathToInputOrOutput((0, devkit_1.joinPathFragments)(tsConfig.options.outDir, `${configBaseNameNoExt}.tsbuildinfo`), workspaceRoot, project);
    }
    return (0, devkit_1.joinPathFragments)('{projectRoot}', `${configBaseNameNoExt}.tsbuildinfo`);
}
function pathToInputOrOutput(path, workspaceRoot, project) {
    const fullProjectRoot = project.absolute;
    const fullPath = (0, node_path_1.resolve)(workspaceRoot, path);
    const pathRelativeToProjectRoot = (0, devkit_1.normalizePath)((0, node_path_1.relative)(fullProjectRoot, fullPath));
    if (pathRelativeToProjectRoot.startsWith('..')) {
        return (0, devkit_1.joinPathFragments)('{workspaceRoot}', (0, node_path_1.relative)(workspaceRoot, fullPath));
    }
    return (0, devkit_1.joinPathFragments)('{projectRoot}', pathRelativeToProjectRoot);
}
function getExtendedConfigFiles(tsConfig, workspaceRoot, cache, extendedConfigFiles = new Set(), extendedExternalPackages = new Set()) {
    for (const extendedConfigFile of tsConfig.extendedConfigFiles) {
        if (extendedConfigFile.externalPackage) {
            extendedExternalPackages.add(extendedConfigFile.externalPackage);
        }
        else if (extendedConfigFile.filePath) {
            extendedConfigFiles.add(extendedConfigFile.filePath);
            getExtendedConfigFiles(retrieveTsConfigFromCache(extendedConfigFile.filePath, workspaceRoot, cache), workspaceRoot, cache, extendedConfigFiles, extendedExternalPackages);
        }
    }
    return {
        files: Array.from(extendedConfigFiles),
        packages: Array.from(extendedExternalPackages),
    };
}
function resolveInternalProjectReferences(tsConfig, workspaceRoot, project, cache, projectReferences = {}) {
    if (!tsConfig.projectReferences?.length) {
        return {};
    }
    for (const ref of tsConfig.projectReferences) {
        let refConfigPath = ref.path;
        if (projectReferences[refConfigPath]) {
            continue;
        }
        if (!(0, node_fs_1.existsSync)(refConfigPath)) {
            continue;
        }
        if (!refConfigPath.endsWith('.json')) {
            refConfigPath = (0, node_path_1.join)(refConfigPath, 'tsconfig.json');
        }
        const refContext = getConfigContext(refConfigPath, workspaceRoot, cache);
        if (isExternalProjectReference(refContext, project, workspaceRoot, cache)) {
            continue;
        }
        projectReferences[refConfigPath] = retrieveTsConfigFromCache(refConfigPath, workspaceRoot, cache);
        resolveInternalProjectReferences(projectReferences[refConfigPath], workspaceRoot, project, cache, projectReferences);
    }
    return projectReferences;
}
function resolveShallowExternalProjectReferences(tsConfig, workspaceRoot, project, cache, projectReferences = {}) {
    if (!tsConfig.projectReferences?.length) {
        return projectReferences;
    }
    for (const ref of tsConfig.projectReferences) {
        let refConfigPath = ref.path;
        if (projectReferences[refConfigPath]) {
            continue;
        }
        if (!(0, node_fs_1.existsSync)(refConfigPath)) {
            continue;
        }
        if (!refConfigPath.endsWith('.json')) {
            refConfigPath = (0, node_path_1.join)(refConfigPath, 'tsconfig.json');
        }
        const refContext = getConfigContext(refConfigPath, workspaceRoot, cache);
        if (isExternalProjectReference(refContext, project, workspaceRoot, cache)) {
            projectReferences[refConfigPath] = retrieveTsConfigFromCache(refConfigPath, workspaceRoot, cache);
        }
    }
    return projectReferences;
}
/**
 * Collects unique tsconfig paths (relative to their project root) from the
 * project reference chain and returns them as `^{projectRoot}/...` input
 * patterns. We only need to discover the full set of distinct relative paths
 * from the reference chain.
 */
function getExternalProjectReferenceTsconfigPatterns(tsConfig, internalProjectReferences, workspaceRoot, project, cache) {
    const externalRefs = {};
    // Collect direct external references from the root tsconfig
    resolveShallowExternalProjectReferences(tsConfig, workspaceRoot, project, cache, externalRefs);
    // Collect external references from internal project references
    for (const refTsConfig of Object.values(internalProjectReferences)) {
        resolveShallowExternalProjectReferences(refTsConfig, workspaceRoot, project, cache, externalRefs);
    }
    // Collect unique tsconfig paths (relative to project root) from the
    // reference chain, seeded with the external refs.
    const uniqueRelPaths = new Set();
    const visited = new Set();
    const worklist = [];
    for (const refConfigPath of Object.keys(externalRefs)) {
        const refContext = getConfigContext(refConfigPath, workspaceRoot, cache);
        uniqueRelPaths.add(posixRelative(refContext.project.absolute, refConfigPath));
        worklist.push({
            configPath: refConfigPath,
            ownerProject: refContext.project,
        });
    }
    for (let i = 0; i < worklist.length; i++) {
        const { configPath, ownerProject } = worklist[i];
        if (visited.has(configPath)) {
            continue;
        }
        visited.add(configPath);
        const wsRelPath = posixRelative(workspaceRoot, configPath);
        const tsConfigData = tsConfigCacheData[wsRelPath]?.data;
        if (!tsConfigData?.projectReferences?.length) {
            continue;
        }
        for (const ref of tsConfigData.projectReferences) {
            let refPath = ref.path;
            if (!refPath.endsWith('.json')) {
                refPath = (0, node_path_1.join)(refPath, 'tsconfig.json');
            }
            // Skip references not found in the tsconfig cache
            const refWsRelPath = posixRelative(workspaceRoot, refPath);
            if (!tsConfigCacheData[refWsRelPath]) {
                continue;
            }
            const refContext = getConfigContext(refPath, workspaceRoot, cache);
            // Collect paths for references within the same project
            if (!isExternalProjectReference(refContext, ownerProject, workspaceRoot, cache)) {
                uniqueRelPaths.add(posixRelative(ownerProject.absolute, refPath));
            }
            if (!visited.has(refPath)) {
                worklist.push({
                    configPath: refPath,
                    ownerProject: refContext.project,
                });
            }
        }
    }
    return Array.from(uniqueRelPaths).map((relPath) => `^{projectRoot}/${relPath}`);
}
function isExternalProjectReference(refConfig, project, workspaceRoot, cache) {
    const owner = cache.configOwners.get(refConfig.relativePath);
    if (owner !== undefined) {
        return owner !== project.normalized;
    }
    let currentPath = refConfig.dirname;
    if ((0, node_path_1.relative)(project.absolute, currentPath).startsWith('..')) {
        return true;
    }
    while (currentPath !== project.absolute) {
        if ((0, node_fs_1.existsSync)((0, node_path_1.join)(currentPath, 'package.json')) ||
            (0, node_fs_1.existsSync)((0, node_path_1.join)(currentPath, 'project.json'))) {
            const owner = posixRelative(workspaceRoot, currentPath);
            cache.configOwners.set(refConfig.relativePath, owner);
            return owner !== project.normalized;
        }
        currentPath = (0, node_path_1.dirname)(currentPath);
    }
    return false;
}
function retrieveTsConfigFromCache(tsConfigPath, workspaceRoot, cache) {
    const relativePath = posixRelative(workspaceRoot, tsConfigPath);
    // we don't need to check the hash if it's in the cache, because we've already
    // checked it when we initially populated the cache
    return tsConfigCacheData[relativePath]
        ? tsConfigCacheData[relativePath].data
        : readTsConfigAndCache(tsConfigPath, workspaceRoot, cache);
}
function initializeTsConfigCache(configFilePaths, workspaceRoot, cache) {
    if (!tsConfigCacheInitialized) {
        tsConfigCacheData = toAbsolutePaths(readTsConfigCacheData(), workspaceRoot);
        tsConfigCacheInitialized = true;
    }
    // ensure hashes are checked and the cache is invalidated and populated as needed
    for (const configFilePath of configFilePaths) {
        const fullConfigPath = (0, node_path_1.join)(workspaceRoot, configFilePath);
        readTsConfigAndCache(fullConfigPath, workspaceRoot, cache);
    }
}
function readTsConfigAndCache(tsConfigPath, workspaceRoot, cache) {
    const relativePath = posixRelative(workspaceRoot, tsConfigPath);
    const hash = getFileHash(tsConfigPath, workspaceRoot, cache);
    let extendedFilesHash;
    if (tsConfigCacheData[relativePath] &&
        tsConfigCacheData[relativePath].hash === hash) {
        extendedFilesHash = getExtendedFilesHash(tsConfigCacheData[relativePath].data.extendedConfigFiles, workspaceRoot, cache);
        if (tsConfigCacheData[relativePath].extendedFilesHash === extendedFilesHash) {
            return tsConfigCacheData[relativePath].data;
        }
    }
    const tsConfig = readTsConfig(tsConfigPath, workspaceRoot, cache);
    const extendedConfigFiles = [];
    if (tsConfig.raw?.extends) {
        const extendsArray = typeof tsConfig.raw.extends === 'string'
            ? [tsConfig.raw.extends]
            : tsConfig.raw.extends;
        for (const extendsPath of extendsArray) {
            const extendedConfigFile = resolveExtendedTsConfigPath(extendsPath, (0, node_path_1.dirname)(tsConfigPath));
            if (extendedConfigFile) {
                extendedConfigFiles.push(extendedConfigFile);
            }
        }
    }
    extendedFilesHash ??= getExtendedFilesHash(extendedConfigFiles, workspaceRoot, cache);
    tsConfigCacheData[relativePath] = {
        data: {
            options: tsConfig.options,
            projectReferences: tsConfig.projectReferences,
            raw: tsConfig.raw,
            extendedConfigFiles,
        },
        hash,
        extendedFilesHash,
    };
    return tsConfigCacheData[relativePath].data;
}
function getExtendedFilesHash(extendedConfigFiles, workspaceRoot, cache) {
    if (!extendedConfigFiles.length) {
        return '';
    }
    // Create a stable cache key from sorted file paths
    const cacheKey = extendedConfigFiles
        .map((f) => f.filePath || f.externalPackage)
        .filter(Boolean)
        .sort()
        .join('|');
    if (cache.extendedFilesHashes.has(cacheKey)) {
        return cache.extendedFilesHashes.get(cacheKey);
    }
    const hashes = [];
    for (const extendedConfigFile of extendedConfigFiles) {
        if (extendedConfigFile.externalPackage) {
            hashes.push(extendedConfigFile.externalPackage);
        }
        else if (extendedConfigFile.filePath) {
            hashes.push(getFileHash(extendedConfigFile.filePath, workspaceRoot, cache));
            hashes.push(getExtendedFilesHash(readTsConfigAndCache(extendedConfigFile.filePath, workspaceRoot, cache).extendedConfigFiles, workspaceRoot, cache));
        }
    }
    const hash = hashes.join('|');
    cache.extendedFilesHashes.set(cacheKey, hash);
    return hash;
}
function readTsConfig(tsConfigPath, workspaceRoot, cache) {
    if (!ts) {
        ts = require('typescript');
    }
    // Normalize to forward slashes for TypeScript compatibility on Windows.
    // TypeScript's parser normalizes paths inconsistently — diagnostics use
    // normalized paths but the source file retains the original, causing
    // assertion failures when backslashes are present.
    tsConfigPath = tsConfigPath.replaceAll('\\', '/');
    const tsSys = {
        ...ts.sys,
        readFile: (path) => readFile(path, workspaceRoot, cache),
        readDirectory: () => [],
    };
    const readResult = ts.readConfigFile(tsConfigPath, tsSys.readFile);
    // read with a custom host that won't read directories which is only used
    // to identify the filenames included in the program, which we won't use
    return ts.parseJsonConfigFileContent(readResult.config, tsSys, (0, node_path_1.dirname)(tsConfigPath));
}
function normalizePluginOptions(pluginOptions = {}) {
    const defaultCompiler = 'tsc';
    const compiler = pluginOptions.compiler ?? defaultCompiler;
    const defaultTypecheckTargetName = 'typecheck';
    const defaultTypecheckConfigName = 'tsconfig.json';
    let typecheck = {
        configName: defaultTypecheckConfigName,
        targetName: defaultTypecheckTargetName,
    };
    if (pluginOptions.typecheck === false) {
        typecheck = false;
    }
    else if (pluginOptions.typecheck &&
        typeof pluginOptions.typecheck !== 'boolean') {
        typecheck = {
            configName: pluginOptions.typecheck.configName ?? defaultTypecheckConfigName,
            targetName: pluginOptions.typecheck.targetName ?? defaultTypecheckTargetName,
        };
    }
    const defaultBuildTargetName = 'build';
    const defaultBuildConfigName = 'tsconfig.lib.json';
    let build = {
        targetName: defaultBuildTargetName,
        configName: defaultBuildConfigName,
        buildDepsName: 'build-deps',
        watchDepsName: 'watch-deps',
        skipBuildCheck: false,
    };
    // Build target is not enabled by default
    if (!pluginOptions.build) {
        build = false;
    }
    else if (pluginOptions.build && typeof pluginOptions.build !== 'boolean') {
        build = {
            targetName: pluginOptions.build.targetName ?? defaultBuildTargetName,
            configName: pluginOptions.build.configName ?? defaultBuildConfigName,
            buildDepsName: pluginOptions.build.buildDepsName ?? 'build-deps',
            watchDepsName: pluginOptions.build.watchDepsName ?? 'watch-deps',
            skipBuildCheck: pluginOptions.build.skipBuildCheck ?? false,
        };
    }
    return {
        compiler,
        typecheck,
        build,
        verboseOutput: pluginOptions.verboseOutput ?? false,
    };
}
function resolveExtendedTsConfigPath(tsConfigPath, directory) {
    try {
        const resolvedPath = require.resolve(tsConfigPath, {
            paths: directory ? [directory] : undefined,
        });
        if (tsConfigPath.startsWith('.') ||
            !resolvedPath.includes('/node_modules/')) {
            return { filePath: resolvedPath };
        }
        // parse the package from the tsconfig path
        const packageName = tsConfigPath.startsWith('@')
            ? tsConfigPath.split('/').slice(0, 2).join('/')
            : tsConfigPath.split('/')[0];
        return { filePath: resolvedPath, externalPackage: packageName };
    }
    catch {
        return null;
    }
}
function getFileHash(filePath, workspaceRoot, cache) {
    const relativePath = posixRelative(workspaceRoot, filePath);
    if (!cache.fileHashes[relativePath]) {
        const content = readFile(filePath, workspaceRoot, cache);
        cache.fileHashes[relativePath] = (0, file_hasher_1.hashArray)([content]);
    }
    return cache.fileHashes[relativePath];
}
function readFile(filePath, workspaceRoot, cache) {
    const relativePath = posixRelative(workspaceRoot, filePath);
    if (!cache.rawFiles[relativePath]) {
        const content = (0, node_fs_1.readFileSync)(filePath, 'utf8');
        cache.rawFiles[relativePath] = content;
    }
    return cache.rawFiles[relativePath];
}
function toAbsolutePaths(cache, workspaceRoot) {
    const updatedCache = {};
    for (const [key, { data, extendedFilesHash, hash }] of Object.entries(cache)) {
        const raw = {
            nx: { addTypecheckTarget: data.raw?.['nx']?.addTypecheckTarget },
        };
        if (data.raw?.include) {
            raw.include = data.raw.include;
        }
        if (data.raw?.exclude) {
            raw.exclude = data.raw.exclude;
        }
        if (data.raw?.files) {
            raw.files = data.raw.files;
        }
        updatedCache[key] = {
            data: {
                options: {
                    noEmit: data.options.noEmit,
                    allowJs: data.options.allowJs,
                    resolveJsonModule: data.options.resolveJsonModule,
                    emitDeclarationOnly: data.options.emitDeclarationOnly,
                    declarationMap: data.options.declarationMap,
                },
                raw,
                extendedConfigFiles: data.extendedConfigFiles,
            },
            extendedFilesHash,
            hash,
        };
        if (data.options.rootDir) {
            updatedCache[key].data.options.rootDir = (0, node_path_1.join)(workspaceRoot, data.options.rootDir);
        }
        if (data.options.outDir) {
            updatedCache[key].data.options.outDir = (0, node_path_1.join)(workspaceRoot, data.options.outDir);
        }
        if (data.options.outFile) {
            updatedCache[key].data.options.outFile = (0, node_path_1.join)(workspaceRoot, data.options.outFile);
        }
        if (data.options.tsBuildInfoFile) {
            updatedCache[key].data.options.tsBuildInfoFile = (0, node_path_1.join)(workspaceRoot, data.options.tsBuildInfoFile);
        }
        if (data.extendedConfigFiles.length) {
            updatedCache[key].data.extendedConfigFiles.forEach((file) => {
                file.filePath = (0, node_path_1.join)(workspaceRoot, file.filePath);
            });
        }
        if (data.projectReferences) {
            updatedCache[key].data.projectReferences = data.projectReferences.map((ref) => ({ ...ref, path: (0, node_path_1.join)(workspaceRoot, ref.path) }));
        }
    }
    return updatedCache;
}
function toRelativePaths(cache, workspaceRoot) {
    const updatedCache = {};
    for (const [key, { data, extendedFilesHash, hash }] of Object.entries(cache)) {
        const raw = {
            nx: { addTypecheckTarget: data.raw?.['nx']?.addTypecheckTarget },
        };
        if (data.raw?.include) {
            raw.include = data.raw.include;
        }
        if (data.raw?.exclude) {
            raw.exclude = data.raw.exclude;
        }
        if (data.raw?.files) {
            raw.files = data.raw.files;
        }
        updatedCache[key] = {
            data: {
                options: {
                    noEmit: data.options.noEmit,
                    allowJs: data.options.allowJs,
                    resolveJsonModule: data.options.resolveJsonModule,
                    emitDeclarationOnly: data.options.emitDeclarationOnly,
                    declarationMap: data.options.declarationMap,
                },
                raw,
                extendedConfigFiles: data.extendedConfigFiles,
            },
            extendedFilesHash,
            hash,
        };
        if (data.options.rootDir) {
            updatedCache[key].data.options.rootDir = posixRelative(workspaceRoot, data.options.rootDir);
        }
        if (data.options.outDir) {
            updatedCache[key].data.options.outDir = posixRelative(workspaceRoot, data.options.outDir);
        }
        if (data.options.outFile) {
            updatedCache[key].data.options.outFile = posixRelative(workspaceRoot, data.options.outFile);
        }
        if (data.options.tsBuildInfoFile) {
            updatedCache[key].data.options.tsBuildInfoFile = posixRelative(workspaceRoot, data.options.tsBuildInfoFile);
        }
        if (data.extendedConfigFiles.length) {
            updatedCache[key].data.extendedConfigFiles.forEach((file) => {
                file.filePath = posixRelative(workspaceRoot, file.filePath);
            });
        }
        if (data.projectReferences) {
            updatedCache[key].data.projectReferences = data.projectReferences.map((ref) => ({
                ...ref,
                path: posixRelative(workspaceRoot, ref.path),
            }));
        }
    }
    return updatedCache;
}
function posixRelative(workspaceRoot, path) {
    return (0, devkit_1.normalizePath)((0, node_path_1.relative)(workspaceRoot, path));
}
