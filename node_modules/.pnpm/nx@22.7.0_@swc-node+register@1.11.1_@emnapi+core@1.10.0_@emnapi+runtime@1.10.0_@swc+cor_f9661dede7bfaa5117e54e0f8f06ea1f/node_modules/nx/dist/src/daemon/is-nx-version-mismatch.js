"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledNxVersion = getInstalledNxVersion;
exports.isNxVersionMismatch = isNxVersionMismatch;
const fileutils_1 = require("../utils/fileutils");
const versions_1 = require("../utils/versions");
const workspace_root_1 = require("../utils/workspace-root");
const installation_directory_1 = require("../utils/installation-directory");
function getInstalledNxVersion() {
    try {
        const nxPackageJsonPath = require.resolve('nx/package.json', {
            paths: (0, installation_directory_1.getNxRequirePaths)(workspace_root_1.workspaceRoot),
        });
        const { version } = (0, fileutils_1.readJsonFile)(nxPackageJsonPath);
        return version;
    }
    catch {
        // node modules are absent
        return null;
    }
}
function isNxVersionMismatch() {
    return getInstalledNxVersion() !== versions_1.nxVersion;
}
