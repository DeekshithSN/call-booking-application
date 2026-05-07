"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDynamicMfManifestFile = getDynamicMfManifestFile;
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const fs_1 = require("fs");
const path_1 = require("path");
function getDynamicMfManifestFile(project, workspaceRoot) {
    // {sourceRoot}/assets/module-federation.manifest.json was the generated
    // path for the manifest file in the past. We now generate the manifest
    // file at {root}/public/module-federation.manifest.json. This check
    // ensures that we can still support the old path for backwards
    // compatibility since old projects may still have the manifest file
    // at the old path.
    return [
        (0, path_1.join)(workspaceRoot, project.root, 'public/module-federation.manifest.json'),
        (0, path_1.join)(workspaceRoot, (0, ts_solution_setup_1.getProjectSourceRoot)(project), 'assets/module-federation.manifest.json'),
    ].find((path) => (0, fs_1.existsSync)(path));
}
