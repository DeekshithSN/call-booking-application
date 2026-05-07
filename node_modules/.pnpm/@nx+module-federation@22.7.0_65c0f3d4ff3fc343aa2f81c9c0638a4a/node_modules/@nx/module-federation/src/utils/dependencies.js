"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDependentPackagesForProject = getDependentPackagesForProject;
const devkit_1 = require("@nx/devkit");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const typescript_1 = require("./typescript");
function getDependentPackagesForProject(projectGraph, name) {
    const { npmPackages, workspaceLibraries } = collectDependencies(projectGraph, name);
    return {
        workspaceLibraries: [...workspaceLibraries.values()],
        npmPackages: [...npmPackages],
    };
}
function collectDependencies(projectGraph, name, dependencies = {
    workspaceLibraries: new Map(),
    npmPackages: new Set(),
}, seen = new Set()) {
    if (seen.has(name)) {
        return dependencies;
    }
    seen.add(name);
    (projectGraph.dependencies[name] ?? []).forEach((dependency) => {
        if (dependency.target.startsWith('npm:')) {
            dependencies.npmPackages.add(dependency.target.replace('npm:', ''));
        }
        else if (!dependency.target.includes(':')) {
            // Only process as workspace library if it's not an external node.
            // External nodes have prefixes like 'npm:', 'cargo:', etc.
            if (projectGraph.nodes[dependency.target]) {
                dependencies.workspaceLibraries.set(dependency.target, {
                    name: dependency.target,
                    root: projectGraph.nodes[dependency.target].data.root,
                    importKey: getLibraryImportPath(dependency.target, projectGraph),
                });
                collectDependencies(projectGraph, dependency.target, dependencies, seen);
            }
        }
        // Skip other external node types (cargo:, etc.)
    });
    return dependencies;
}
function getLibraryImportPath(library, projectGraph) {
    let buildLibsFromSource = true;
    if (process.env.NX_BUILD_LIBS_FROM_SOURCE) {
        buildLibsFromSource = process.env.NX_BUILD_LIBS_FROM_SOURCE === 'true';
    }
    const libraryNode = projectGraph.nodes[library];
    let sourceRoots = [(0, ts_solution_setup_1.getProjectSourceRoot)(libraryNode.data)];
    if (!buildLibsFromSource && process.env.NX_BUILD_TARGET) {
        const buildTarget = (0, devkit_1.parseTargetString)(process.env.NX_BUILD_TARGET, projectGraph);
        sourceRoots = (0, devkit_1.getOutputsForTargetAndConfiguration)(buildTarget, {}, libraryNode);
    }
    const tsConfigPathMappings = (0, typescript_1.readTsPathMappings)();
    for (const [key, value] of Object.entries(tsConfigPathMappings)) {
        for (const src of sourceRoots) {
            if (value.find((path) => path.startsWith(src))) {
                return key;
            }
        }
    }
    // Return library name if not found in TS path mappings
    // This supports TS Solution + PM Workspaces where libs use package.json instead
    return library;
}
