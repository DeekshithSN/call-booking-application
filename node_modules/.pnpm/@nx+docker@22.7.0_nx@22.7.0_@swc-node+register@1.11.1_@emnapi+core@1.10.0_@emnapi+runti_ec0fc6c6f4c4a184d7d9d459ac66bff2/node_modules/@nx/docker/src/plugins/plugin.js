"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodesV2 = void 0;
exports.getProjectNameFromPath = getProjectNameFromPath;
const devkit_1 = require("@nx/devkit");
const calculate_hash_for_create_nodes_1 = require("@nx/devkit/src/utils/calculate-hash-for-create-nodes");
const file_hasher_1 = require("nx/src/hasher/file-hasher");
const cache_directory_1 = require("nx/src/utils/cache-directory");
const fs_1 = require("fs");
const path_1 = require("path");
const get_named_inputs_1 = require("@nx/devkit/src/utils/get-named-inputs");
const git_utils_1 = require("nx/src/utils/git-utils");
const interpolate_pattern_1 = require("../utils/interpolate-pattern");
function readTargetsCache(cachePath) {
    return (0, fs_1.existsSync)(cachePath) ? (0, devkit_1.readJsonFile)(cachePath) : {};
}
function writeTargetsCache(cachePath, results) {
    (0, devkit_1.writeJsonFile)(cachePath, results ?? {});
}
const dockerfileGlob = '**/Dockerfile';
exports.createNodesV2 = [
    dockerfileGlob,
    async (configFilePaths, options, context) => {
        const optionsHash = (0, file_hasher_1.hashObject)(options);
        const cachePath = (0, path_1.join)(cache_directory_1.workspaceDataDirectory, `docker-${optionsHash}.hash`);
        const targetsCache = readTargetsCache(cachePath);
        const projectRoots = configFilePaths.map((c) => (0, path_1.dirname)(c));
        const normalizedOptions = normalizePluginOptions(options);
        // TODO(colum): investigate hashing only the dockerfile
        const hashes = await (0, calculate_hash_for_create_nodes_1.calculateHashesForCreateNodes)(projectRoots, normalizedOptions, context);
        try {
            return await (0, devkit_1.createNodesFromFiles)((configFile, _, context, idx) => createNodesInternal(configFile, hashes[idx] + configFile, normalizedOptions, context, targetsCache), configFilePaths, options, context);
        }
        finally {
            writeTargetsCache(cachePath, targetsCache);
        }
    },
];
async function createNodesInternal(configFilePath, hash, normalizedOptions, context, targetsCache) {
    const projectRoot = (0, path_1.dirname)(configFilePath);
    targetsCache[hash] ??= await createDockerTargets(projectRoot, normalizedOptions, context);
    const { targets, metadata } = targetsCache[hash];
    return {
        projects: {
            [projectRoot]: {
                root: projectRoot,
                targets,
                metadata,
            },
        },
    };
}
function interpolateDockerTargetOptions(options, projectRoot, imageRef, context) {
    const commitSha = (0, git_utils_1.getLatestCommitSha)();
    const projectName = getProjectName(projectRoot, context.workspaceRoot);
    const tokens = {
        projectRoot,
        projectName,
        imageRef,
        currentDate: new Date(),
        commitSha,
        shortCommitSha: commitSha ? commitSha.slice(0, 7) : null,
    };
    return (0, interpolate_pattern_1.interpolateObject)(options, tokens);
}
function getProjectNameFromPath(projectRoot, workspaceRoot) {
    const root = projectRoot === '.' ? workspaceRoot : projectRoot;
    const normalized = root
        .replace(/^[\\/]/, '')
        .replace(/[\\/\s]+/g, '-')
        .toLowerCase();
    return normalized.length > 128 ? normalized.slice(-128) : normalized;
}
function getProjectName(projectRoot, workspaceRoot) {
    const projectJsonPath = (0, path_1.join)(workspaceRoot, projectRoot, 'project.json');
    if ((0, fs_1.existsSync)(projectJsonPath)) {
        const projectJson = (0, devkit_1.readJsonFile)(projectJsonPath);
        if (projectJson.name) {
            return projectJson.name;
        }
    }
    const packageJsonPath = (0, path_1.join)(workspaceRoot, projectRoot, 'package.json');
    if ((0, fs_1.existsSync)(packageJsonPath)) {
        const packageJson = (0, devkit_1.readJsonFile)(packageJsonPath);
        if (packageJson.name) {
            return packageJson.name;
        }
    }
    return getProjectNameFromPath(projectRoot, workspaceRoot);
}
function buildTargetOptions(interpolatedTarget, projectRoot, imageRef, isRunTarget = false) {
    const options = {
        cwd: interpolatedTarget.cwd ?? projectRoot,
    };
    if (isRunTarget) {
        // Run target doesn't have default args
        if (interpolatedTarget.args) {
            options.args = interpolatedTarget.args;
        }
    }
    else {
        // Build target includes --tag default unless skipDefaultTag is true
        if (interpolatedTarget.skipDefaultTag) {
            options.args = interpolatedTarget.args ?? [];
        }
        else {
            options.args = [`--tag ${imageRef}`, ...(interpolatedTarget.args ?? [])];
        }
    }
    if (interpolatedTarget.env) {
        options.env = interpolatedTarget.env;
    }
    if (interpolatedTarget.envFile) {
        options.envFile = interpolatedTarget.envFile;
    }
    return options;
}
function buildTargetConfigurations(interpolatedTarget, projectRoot, imageRef, isRunTarget = false) {
    if (!interpolatedTarget.configurations) {
        return undefined;
    }
    const configurations = {};
    for (const [configName, configOptions] of Object.entries(interpolatedTarget.configurations)) {
        // Each configuration gets the full treatment with defaults
        // Inherit skipDefaultTag from parent if not explicitly set in config
        configurations[configName] = buildTargetOptions({
            ...configOptions,
            name: interpolatedTarget.name,
            skipDefaultTag: configOptions.skipDefaultTag ?? interpolatedTarget.skipDefaultTag,
        }, projectRoot, imageRef, isRunTarget);
    }
    return configurations;
}
async function createDockerTargets(projectRoot, options, context) {
    const imageRef = getProjectNameFromPath(projectRoot, devkit_1.workspaceRoot);
    const interpolatedBuildTarget = interpolateDockerTargetOptions(options.buildTarget, projectRoot, imageRef, context);
    const interpolatedRunTarget = interpolateDockerTargetOptions(options.runTarget, projectRoot, imageRef, context);
    const namedInputs = (0, get_named_inputs_1.getNamedInputs)(projectRoot, context);
    const targets = {};
    const metadata = {
        targetGroups: {
            ['Docker']: [
                interpolatedBuildTarget.name,
                interpolatedRunTarget.name,
                'nx-release-publish',
            ],
        },
    };
    const buildOptions = buildTargetOptions(interpolatedBuildTarget, projectRoot, imageRef, false);
    const buildConfigurations = buildTargetConfigurations(interpolatedBuildTarget, projectRoot, imageRef, false);
    targets[interpolatedBuildTarget.name] = {
        dependsOn: ['build', '^build'],
        command: `docker build .`,
        options: buildOptions,
        ...(buildConfigurations && { configurations: buildConfigurations }),
        inputs: [
            ...('production' in namedInputs
                ? ['production', '^production']
                : ['default', '^default']),
        ],
        metadata: {
            technologies: ['docker'],
            description: `Run Docker build`,
            help: {
                command: `docker build --help`,
                example: {
                    options: {
                        'cache-from': 'type=s3,region=eu-west-1,bucket=mybucket .',
                        'cache-to': 'type=s3,region=eu-west-1,bucket=mybucket .',
                    },
                },
            },
        },
    };
    const runOptions = buildTargetOptions(interpolatedRunTarget, projectRoot, imageRef, true);
    const runConfigurations = buildTargetConfigurations(interpolatedRunTarget, projectRoot, imageRef, true);
    targets[interpolatedRunTarget.name] = {
        dependsOn: [interpolatedBuildTarget.name],
        command: `docker run {args} ${imageRef}`,
        options: runOptions,
        ...(runConfigurations && { configurations: runConfigurations }),
        inputs: [
            ...('production' in namedInputs
                ? ['production', '^production']
                : ['default', '^default']),
        ],
        metadata: {
            technologies: ['docker'],
            description: `Run Docker run`,
            help: {
                command: `docker run --help`,
                example: {
                    options: {
                        args: ['-p', '3000:3000'],
                    },
                },
            },
        },
    };
    targets['nx-release-publish'] = {
        executor: '@nx/docker:release-publish',
    };
    return { targets, metadata };
}
function normalizePluginOptions(options) {
    const normalizeTarget = (target, defaultName) => {
        if (typeof target === 'string') {
            return { name: target };
        }
        if (target && typeof target === 'object') {
            return { ...target, name: target.name ?? defaultName };
        }
        return { name: defaultName };
    };
    return {
        buildTarget: normalizeTarget(options?.buildTarget, 'docker:build'),
        runTarget: normalizeTarget(options?.runTarget, 'docker:run'),
    };
}
