"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectConfig = updateProjectConfig;
exports.setupDockerGenerator = setupDockerGenerator;
const devkit_1 = require("@nx/devkit");
const generators_1 = require("@nx/docker/generators");
const path_1 = require("path");
const fs_1 = require("fs");
function normalizeOptions(tree, setupOptions) {
    return {
        ...setupOptions,
        project: setupOptions.project ?? (0, devkit_1.readNxJson)(tree).defaultProject,
        targetName: setupOptions.targetName ?? 'docker:build',
        buildTarget: setupOptions.buildTarget ?? 'build',
        skipDockerPlugin: setupOptions.skipDockerPlugin ?? false,
    };
}
function sanitizeProjectName(projectName) {
    return projectName
        .toLowerCase()
        .replace(/[@\/]/g, '-')
        .replace(/[^a-z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
async function addDocker(tree, options) {
    let installTask = () => { };
    if (!options.skipDockerPlugin) {
        installTask = await (0, generators_1.initGenerator)(tree, { skipFormat: true });
    }
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const outputPath = projectConfig.targets[options.buildTarget]?.options['outputPath'];
    if (!projectConfig) {
        throw new Error(`Cannot find project configuration for ${options.project}`);
    }
    if (!outputPath && !options.outputPath) {
        throw new Error(`The output path for the project ${options.project} is not defined. Please provide it as an option to the generator.`);
    }
    const sanitizedProjectName = sanitizeProjectName(options.project);
    const finalOutputPath = options.outputPath ?? outputPath;
    // Calculate build location based on skipDockerPlugin flag
    let buildLocation;
    if (options.skipDockerPlugin) {
        // Legacy mode: use workspace-relative paths
        // docker target is set to run at project root, so ensure offset to workspace root
        buildLocation = (0, devkit_1.joinPathFragments)((0, devkit_1.offsetFromRoot)(projectConfig.root), finalOutputPath);
    }
    else {
        // New mode: use project-relative paths
        // Remove the project root prefix from the output path
        const projectRootWithSlash = projectConfig.root + '/';
        buildLocation = finalOutputPath.startsWith(projectRootWithSlash)
            ? finalOutputPath.substring(projectRootWithSlash.length)
            : finalOutputPath.startsWith(projectConfig.root)
                ? finalOutputPath.substring(projectConfig.root.length)
                : 'dist';
    }
    const packageManager = (0, fs_1.existsSync)(projectConfig.root)
        ? (0, devkit_1.detectPackageManager)(projectConfig.root)
        : (0, devkit_1.detectPackageManager)(devkit_1.workspaceRoot);
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, './files'), projectConfig.root, {
        tmpl: '',
        buildLocation,
        project: options.project,
        projectPath: projectConfig.root,
        sanitizedProjectName,
        skipDockerPlugin: options.skipDockerPlugin,
        packageManager,
    });
    return installTask;
}
function updateProjectConfig(tree, options) {
    let projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    if (options.skipDockerPlugin) {
        // Use sanitized project name for Docker image tag
        const sanitizedProjectName = sanitizeProjectName(options.project);
        projectConfig.targets[`${options.targetName}`] = {
            dependsOn: [`${options.buildTarget}`, 'prune'],
            command: `docker build . -t ${sanitizedProjectName}`,
            options: {
                cwd: projectConfig.root,
            },
        };
    }
    else {
        projectConfig.targets[`${options.targetName}`] = {
            dependsOn: [`${options.buildTarget}`, 'prune'],
        };
    }
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, projectConfig);
}
async function setupDockerGenerator(tree, setupOptions) {
    const tasks = [];
    const options = normalizeOptions(tree, setupOptions);
    const installTask = await addDocker(tree, options);
    tasks.push(installTask);
    updateProjectConfig(tree, options);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = setupDockerGenerator;
