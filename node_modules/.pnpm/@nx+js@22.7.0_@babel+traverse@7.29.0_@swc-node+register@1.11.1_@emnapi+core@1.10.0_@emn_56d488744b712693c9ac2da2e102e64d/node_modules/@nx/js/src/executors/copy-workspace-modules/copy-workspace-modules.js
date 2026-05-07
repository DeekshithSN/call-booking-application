"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = copyWorkspaceModules;
const devkit_1 = require("@nx/devkit");
const utils_1 = require("nx/src/tasks-runner/utils");
const node_fs_1 = require("node:fs");
const path_1 = require("path");
const fs_1 = require("fs");
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
const get_workspace_packages_from_graph_1 = require("nx/src/plugins/js/utils/get-workspace-packages-from-graph");
async function copyWorkspaceModules(schema, context) {
    devkit_1.logger.log('Copying Workspace Modules to Build Directory...');
    const outputDirectory = getOutputDir(schema, context);
    const packageJson = getPackageJson(schema, context);
    createWorkspaceModules(outputDirectory);
    handleWorkspaceModules(outputDirectory, packageJson, context.projectGraph);
    devkit_1.logger.log('Success!');
    return { success: true };
}
function handleWorkspaceModules(outputDirectory, packageJson, projectGraph) {
    if (!packageJson.dependencies) {
        return;
    }
    const workspaceModules = (0, get_workspace_packages_from_graph_1.getWorkspacePackagesFromGraph)(projectGraph);
    const processedModules = new Set();
    const workspaceModulesDir = (0, path_1.join)(outputDirectory, 'workspace_modules');
    function calculateRelativePath(fromPkgName, toPkgName) {
        const fromPath = (0, path_1.join)(workspaceModulesDir, fromPkgName);
        const toPath = (0, path_1.join)(workspaceModulesDir, toPkgName);
        const relativePath = (0, path_1.relative)(fromPath, toPath);
        // Ensure forward slashes for file: protocol (Windows compatibility)
        return relativePath.split(path_1.sep).join('/');
    }
    function processModule(pkgName) {
        if (processedModules.has(pkgName)) {
            devkit_1.logger.verbose(`Skipping ${pkgName} (already processed).`);
            return;
        }
        if (!workspaceModules.has(pkgName)) {
            return;
        }
        processedModules.add(pkgName);
        devkit_1.logger.verbose(`Copying ${pkgName}.`);
        const workspaceModuleProject = workspaceModules.get(pkgName);
        const workspaceModuleRoot = workspaceModuleProject.data.root;
        const newWorkspaceModulePath = (0, path_1.join)(workspaceModulesDir, pkgName);
        // Copy the module
        (0, node_fs_1.mkdirSync)(newWorkspaceModulePath, { recursive: true });
        (0, node_fs_1.cpSync)(workspaceModuleRoot, newWorkspaceModulePath, {
            filter: (src) => !src.includes('node_modules'),
            recursive: true,
        });
        devkit_1.logger.verbose(`Copied ${pkgName} successfully.`);
        // Read the copied module's package.json to process its dependencies
        const copiedPackageJsonPath = (0, path_1.join)(newWorkspaceModulePath, 'package.json');
        let copiedPackageJson;
        try {
            copiedPackageJson = JSON.parse((0, node_fs_1.readFileSync)(copiedPackageJsonPath, 'utf-8'));
        }
        catch (e) {
            devkit_1.logger.warn(`Could not read package.json for ${pkgName}: ${e.message}`);
            return;
        }
        // Process and update dependencies
        if (copiedPackageJson.dependencies) {
            let packageJsonModified = false;
            for (const [depName, depVersion] of Object.entries(copiedPackageJson.dependencies)) {
                if (workspaceModules.has(depName)) {
                    const relativePath = calculateRelativePath(pkgName, depName);
                    copiedPackageJson.dependencies[depName] = `file:${relativePath}`;
                    packageJsonModified = true;
                    processModule(depName);
                }
            }
            if (packageJsonModified) {
                (0, node_fs_1.writeFileSync)(copiedPackageJsonPath, JSON.stringify(copiedPackageJson, null, 2));
                devkit_1.logger.verbose(`Updated package.json for ${pkgName} with relative workspace module paths.`);
            }
        }
    }
    // Process all top-level dependencies
    for (const [pkgName] of Object.entries(packageJson.dependencies)) {
        processModule(pkgName);
    }
}
function createWorkspaceModules(outputDirectory) {
    (0, node_fs_1.mkdirSync)((0, path_1.join)(outputDirectory, 'workspace_modules'), { recursive: true });
}
function getPackageJson(schema, context) {
    const target = (0, devkit_1.parseTargetString)(schema.buildTarget, context);
    const project = context.projectGraph.nodes[target.project].data;
    const packageJsonPath = (0, path_1.join)(devkit_1.workspaceRoot, project.root, 'package.json');
    if (!(0, node_fs_1.existsSync)(packageJsonPath)) {
        throw new Error(`${packageJsonPath} does not exist.`);
    }
    const packageJson = (0, devkit_1.readJsonFile)(packageJsonPath);
    return packageJson;
}
function getOutputDir(schema, context) {
    let outputDir = schema.outputPath;
    if (outputDir) {
        outputDir = normalizeOutputPath(outputDir);
        if ((0, node_fs_1.existsSync)(outputDir)) {
            return outputDir;
        }
    }
    const target = (0, devkit_1.parseTargetString)(schema.buildTarget, context);
    const project = context.projectGraph.nodes[target.project].data;
    const buildTarget = project.targets[target.target];
    let maybeOutputPath = buildTarget.outputs?.[0] ??
        buildTarget.options.outputPath ??
        buildTarget.options.outputDir;
    if (!maybeOutputPath) {
        throw new Error(`Could not infer an output directory from the '${schema.buildTarget}' target. Please provide 'outputPath'.`);
    }
    maybeOutputPath = (0, utils_1.interpolate)(maybeOutputPath, {
        workspaceRoot: devkit_1.workspaceRoot,
        projectRoot: project.root,
        projectName: project.name,
        options: {
            ...(buildTarget.options ?? {}),
        },
    });
    outputDir = normalizeOutputPath(maybeOutputPath);
    if (!(0, node_fs_1.existsSync)(outputDir)) {
        throw new Error(`The output directory '${outputDir}' inferred from the '${schema.buildTarget}' target does not exist.\nPlease ensure a build has run first, and that the path is correct. Otherwise, please provide 'outputPath'.`);
    }
    return outputDir;
}
function normalizeOutputPath(outputPath) {
    if (!outputPath.startsWith(devkit_1.workspaceRoot)) {
        outputPath = (0, path_1.join)(devkit_1.workspaceRoot, outputPath);
    }
    if (!(0, fs_1.lstatSync)(outputPath).isDirectory()) {
        outputPath = (0, path_1.dirname)(outputPath);
    }
    return outputPath;
}
