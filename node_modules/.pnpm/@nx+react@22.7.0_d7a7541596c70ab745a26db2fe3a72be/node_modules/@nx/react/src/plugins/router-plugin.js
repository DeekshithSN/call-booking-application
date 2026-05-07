"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodesV2 = void 0;
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
const fs_1 = require("fs");
const get_named_inputs_1 = require("@nx/devkit/src/utils/get-named-inputs");
const cache_directory_1 = require("nx/src/utils/cache-directory");
const calculate_hash_for_create_nodes_1 = require("@nx/devkit/src/utils/calculate-hash-for-create-nodes");
const js_1 = require("@nx/js");
const devkit_internals_1 = require("nx/src/devkit-internals");
const util_1 = require("@nx/js/src/plugins/typescript/util");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const config_utils_1 = require("@nx/devkit/src/utils/config-utils");
const pmCommand = (0, devkit_1.getPackageManagerCommand)();
const reactRouterConfigBlob = '**/react-router.config.{ts,js,cjs,cts,mjs,mts}';
function readTargetsCache(cachePath) {
    return process.env.NX_CACHE_PROJECT_GRAPH !== 'false' && (0, fs_1.existsSync)(cachePath)
        ? (0, devkit_1.readJsonFile)(cachePath)
        : {};
}
function writeTargetsToCache(cachePath, results) {
    (0, devkit_1.writeJsonFile)(cachePath, results);
}
exports.createNodesV2 = [
    reactRouterConfigBlob,
    async (configFiles, options, context) => {
        const optionsHash = (0, devkit_internals_1.hashObject)(options);
        const normalizedOptions = normalizeOptions(options);
        const cachePath = (0, path_1.join)(cache_directory_1.workspaceDataDirectory, `react-router-${optionsHash}.hash`);
        const targetsCache = readTargetsCache(cachePath);
        const isUsingTsSolutionSetup = (0, ts_solution_setup_1.isUsingTsSolutionSetup)();
        const { roots: projectRoots, configFiles: validConfigFiles } = configFiles.reduce((acc, configFile) => {
            const potentialRoot = (0, path_1.dirname)(configFile);
            if (checkIfConfigFileShouldBeProject(potentialRoot, context)) {
                acc.roots.push(potentialRoot);
                acc.configFiles.push(configFile);
            }
            return acc;
        }, {
            roots: [],
            configFiles: [],
        });
        const lockfile = (0, js_1.getLockFileName)((0, devkit_1.detectPackageManager)(context.workspaceRoot));
        const hashes = await (0, calculate_hash_for_create_nodes_1.calculateHashesForCreateNodes)(projectRoots, { ...normalizedOptions, isUsingTsSolutionSetup }, context, projectRoots.map((_) => [lockfile]));
        try {
            return await (0, devkit_1.createNodesFromFiles)(async (configFile, _, context, idx) => {
                const projectRoot = (0, path_1.dirname)(configFile);
                const siblingFiles = (0, fs_1.readdirSync)((0, devkit_1.joinPathFragments)(context.workspaceRoot, projectRoot));
                const hash = hashes[idx] + configFile;
                const { projectType, metadata, targets } = (targetsCache[hash] ??=
                    await buildReactRouterTargets(configFile, projectRoot, normalizedOptions, context, siblingFiles, isUsingTsSolutionSetup));
                const project = {
                    root: projectRoot,
                    targets,
                    metadata,
                };
                if (project.targets[normalizedOptions.buildTargetName]) {
                    project.projectType = projectType;
                }
                return {
                    projects: {
                        [projectRoot]: project,
                    },
                };
            }, validConfigFiles, options, context);
        }
        finally {
            writeTargetsToCache(cachePath, targetsCache);
        }
    },
];
async function buildReactRouterTargets(configFilePath, projectRoot, options, context, siblingFiles, isUsingTsSolutionSetup) {
    const namedInputs = (0, get_named_inputs_1.getNamedInputs)(projectRoot, context);
    const configPath = (0, path_1.join)(context.workspaceRoot, configFilePath);
    if (require.cache[configPath])
        (0, config_utils_1.clearRequireCache)();
    const reactRouterConfig = await (0, config_utils_1.loadConfigFile)(configPath);
    const isLibMode = reactRouterConfig?.ssr !== undefined && reactRouterConfig.ssr === false;
    const { buildDirectory, serverBuildPath } = await getBuildPaths(reactRouterConfig, isLibMode);
    const targets = {};
    targets[options.buildTargetName] = await getBuildTargetConfig(options.buildTargetName, projectRoot, buildDirectory, serverBuildPath, namedInputs, isUsingTsSolutionSetup);
    targets[options.devTargetName] = await devTarget(projectRoot, isUsingTsSolutionSetup);
    if (serverBuildPath) {
        targets[options.startTargetName] = await startTarget(projectRoot, serverBuildPath, options.buildTargetName, isUsingTsSolutionSetup);
    }
    targets[options.typecheckTargetName] = await typecheckTarget(projectRoot, options.typecheckTargetName, namedInputs, siblingFiles, isUsingTsSolutionSetup);
    (0, util_1.addBuildAndWatchDepsTargets)(context.workspaceRoot, projectRoot, targets, options, pmCommand);
    const metadata = {};
    return {
        targets,
        metadata,
        projectType: isLibMode ? 'library' : 'application',
    };
}
async function getBuildTargetConfig(buildTargetName, projectRoot, buildDirectory, serverBuildDirectory, namedInputs, isUsingTsSolutionSetup) {
    const basePath = projectRoot === '.'
        ? `{workspaceRoot}`
        : (0, devkit_1.joinPathFragments)(`{workspaceRoot}`, projectRoot);
    const outputs = [
        (0, devkit_1.joinPathFragments)(basePath, buildDirectory),
        ...(serverBuildDirectory
            ? [(0, devkit_1.joinPathFragments)(basePath, serverBuildDirectory)]
            : []),
    ];
    const buildTarget = {
        cache: true,
        dependsOn: [`^${buildTargetName}`],
        inputs: [
            ...('production' in namedInputs
                ? ['production', '^production']
                : ['default', '^default']),
            { externalDependencies: ['@react-router/dev'] },
        ],
        outputs,
        command: 'react-router build',
        options: { cwd: projectRoot },
    };
    if (isUsingTsSolutionSetup) {
        buildTarget.syncGenerators = ['@nx/js:typescript-sync'];
    }
    return buildTarget;
}
async function getBuildPaths(reactRouterConfig, isLibMode) {
    return {
        buildDirectory: reactRouterConfig?.buildDirectory ?? 'build/client',
        ...(isLibMode
            ? undefined
            : {
                serverBuildPath: reactRouterConfig?.buildDirectory
                    ? (0, path_1.join)((0, path_1.dirname)(reactRouterConfig.buildDirectory), `server`)
                    : 'build/server',
            }),
    };
}
async function devTarget(projectRoot, isUsingTsSolutionSetup) {
    const devTarget = {
        continuous: true,
        command: 'react-router dev',
        options: { cwd: projectRoot },
    };
    if (isUsingTsSolutionSetup) {
        devTarget.syncGenerators = ['@nx/js:typescript-sync'];
    }
    return devTarget;
}
async function startTarget(projectRoot, serverBuildPath, buildTargetName, isUsingTsSolutionSetup) {
    const serverPath = serverBuildPath === 'build/server'
        ? `${serverBuildPath}/index.js`
        : serverBuildPath;
    const startTarget = {
        continuous: true,
        dependsOn: [buildTargetName],
        command: `react-router-serve ${serverPath}`,
        options: { cwd: projectRoot },
    };
    if (isUsingTsSolutionSetup) {
        startTarget.syncGenerators = ['@nx/js:typescript-sync'];
    }
    return startTarget;
}
async function typecheckTarget(projectRoot, typecheckTargetName, namedInputs, siblingFiles, isUsingTsSolutionSetup) {
    const hasTsConfigAppJson = siblingFiles.includes('tsconfig.app.json');
    const typecheckTarget = {
        cache: true,
        inputs: [
            ...('production' in namedInputs
                ? ['production', '^production']
                : ['default', '^default']),
            { externalDependencies: ['typescript'] },
        ],
        command: isUsingTsSolutionSetup
            ? `tsc --build --emitDeclarationOnly`
            : `tsc${hasTsConfigAppJson ? ` -p tsconfig.app.json` : ``} --noEmit`,
        options: {
            cwd: projectRoot,
        },
        metadata: {
            description: `Runs type-checking for the project.`,
            technologies: ['typescript'],
            help: {
                command: isUsingTsSolutionSetup
                    ? `${pmCommand.exec} tsc --build --help`
                    : `${pmCommand.exec} tsc${hasTsConfigAppJson ? ` -p tsconfig.app.json` : ``} --help`,
                example: isUsingTsSolutionSetup
                    ? { args: ['--force'] }
                    : { options: { noEmit: true } },
            },
        },
    };
    if (isUsingTsSolutionSetup) {
        typecheckTarget.dependsOn = [`^${typecheckTargetName}`];
        typecheckTarget.syncGenerators = ['@nx/js:typescript-sync'];
    }
    return typecheckTarget;
}
function normalizeOptions(options) {
    options ??= {};
    options.buildTargetName ??= 'build';
    options.devTargetName ??= 'dev';
    options.startTargetName ??= 'start';
    options.typecheckTargetName ??= 'typecheck';
    return options;
}
function checkIfConfigFileShouldBeProject(projectRoot, context) {
    // Do not create a project if package.json and project.json isn't there.
    const siblingFiles = (0, fs_1.readdirSync)((0, path_1.join)(context.workspaceRoot, projectRoot));
    return hasRequiredConfigs(siblingFiles);
}
function hasRequiredConfigs(files) {
    const lowerFiles = files.map((file) => file.toLowerCase());
    // Check if vite.config.{ext} is present
    const hasViteConfig = lowerFiles.some((file) => {
        const parts = file.split('.');
        return parts[0] === 'vite' && parts[1] === 'config' && parts.length > 2;
    });
    if (!hasViteConfig)
        return false;
    const hasProjectOrPackageJson = lowerFiles.includes('project.json') || lowerFiles.includes('package.json');
    return hasProjectOrPackageJson;
}
