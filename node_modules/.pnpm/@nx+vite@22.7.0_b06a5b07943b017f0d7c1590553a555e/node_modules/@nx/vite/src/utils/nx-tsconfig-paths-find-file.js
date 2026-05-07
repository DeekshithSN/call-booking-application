"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFile = findFile;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function findFile(path, extensions, existsSyncImpl = node_fs_1.existsSync) {
    const queryLessPath = path.replace(/\?\S*$/, '');
    for (const ext of extensions) {
        const dir = (0, node_path_1.dirname)(path);
        // Support file extensions such as .css and .js in the import path.
        // While still allowing for '.suffix'
        const name = (0, node_path_1.basename)(queryLessPath, ext);
        const resolvedPath = (0, node_path_1.resolve)(dir, name + ext);
        if (existsSyncImpl(resolvedPath)) {
            return resolvedPath;
        }
        const resolvedIndexPath = (0, node_path_1.resolve)(path, `index${ext}`);
        if (existsSyncImpl(resolvedIndexPath)) {
            return resolvedIndexPath;
        }
    }
}
