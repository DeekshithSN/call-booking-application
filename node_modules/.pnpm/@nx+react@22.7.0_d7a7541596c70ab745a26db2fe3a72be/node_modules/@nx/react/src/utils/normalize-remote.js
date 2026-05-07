"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRemoteName = normalizeRemoteName;
exports.normalizeRemoteDirectory = normalizeRemoteDirectory;
const devkit_1 = require("@nx/devkit");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
async function normalizeRemoteName(tree, remote, options) {
    const { projectName: remoteName } = await (0, project_name_and_root_utils_1.determineProjectNameAndRootOptions)(tree, {
        name: remote,
        projectType: 'application',
        directory: options.directory,
    });
    return remoteName;
}
function normalizeRemoteDirectory(remote, options) {
    /**
     * With the `as-provided` format, the provided directory would be the root
     * of the host application. Append the remote name to the host parent
     * directory to get the remote directory.
     *
     * If no directory is provided, the remote directory will use the grandparent of the hostRoot 'acme/host/src' -> 'acme'
     */
    if (options.directory) {
        return (0, devkit_1.joinPathFragments)(options.directory, '..', remote);
    }
    else {
        return options.appProjectRoot === '.'
            ? remote
            : (0, devkit_1.joinPathFragments)(options.appProjectRoot, '..', remote);
    }
}
