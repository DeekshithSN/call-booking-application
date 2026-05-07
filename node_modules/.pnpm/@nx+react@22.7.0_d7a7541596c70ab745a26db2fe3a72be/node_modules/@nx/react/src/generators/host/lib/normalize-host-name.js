"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHostName = normalizeHostName;
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
async function normalizeHostName(tree, directory, name) {
    const { projectName } = await (0, project_name_and_root_utils_1.determineProjectNameAndRootOptions)(tree, {
        name,
        directory,
        projectType: 'application',
    });
    return projectName;
}
