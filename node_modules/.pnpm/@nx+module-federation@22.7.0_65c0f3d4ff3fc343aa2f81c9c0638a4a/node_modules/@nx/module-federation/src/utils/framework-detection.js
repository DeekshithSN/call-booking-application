"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReactProject = isReactProject;
const dependencies_1 = require("./dependencies");
function isReactProject(projectName, projectGraph) {
    const project = projectGraph.nodes[projectName];
    if (!project)
        return false;
    // Check if the project has React dependencies
    const { npmPackages } = (0, dependencies_1.getDependentPackagesForProject)(projectGraph, projectName);
    // Check for React-related packages
    const reactPackages = [
        'react',
        'react-dom',
        '@types/react',
        '@types/react-dom',
    ];
    const hasReactDependencies = reactPackages.some((pkg) => npmPackages.includes(pkg));
    return hasReactDependencies;
}
