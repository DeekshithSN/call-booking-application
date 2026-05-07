"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectNode = getProjectNode;
const devkit_1 = require("@nx/devkit");
function getProjectNode() {
    // During graph construction, project is not necessary. Return a stub.
    if (global.NX_GRAPH_CREATION) {
        return {
            type: 'lib',
            name: '',
            data: {
                root: '',
            },
        };
    }
    else {
        const projectGraph = (0, devkit_1.readCachedProjectGraph)();
        const projectName = process.env.NX_TASK_TARGET_PROJECT;
        return projectGraph.nodes[projectName];
    }
}
