"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRemotes = mapRemotes;
exports.mapRemotesForSSR = mapRemotesForSSR;
const url_helpers_1 = require("./url-helpers");
const normalize_project_name_1 = require("./normalize-project-name");
/**
 * Map remote names to a format that can be understood and used by Module
 * Federation.
 *
 * @param remotes - The remotes to map
 * @param remoteEntryExt - The file extension of the remoteEntry file
 * @param determineRemoteUrl - The function used to lookup the URL of the served remote
 */
function mapRemotes(remotes, remoteEntryExt, determineRemoteUrl, isRemoteGlobal = false) {
    const mappedRemotes = {};
    for (const nxRemoteProjectName of remotes) {
        if (Array.isArray(nxRemoteProjectName)) {
            const mfRemoteName = nxRemoteProjectName[0];
            mappedRemotes[mfRemoteName] = handleArrayRemote(nxRemoteProjectName, remoteEntryExt, isRemoteGlobal);
        }
        else if (typeof nxRemoteProjectName === 'string') {
            mappedRemotes[nxRemoteProjectName] = handleStringRemote(nxRemoteProjectName, determineRemoteUrl, isRemoteGlobal);
        }
    }
    return mappedRemotes;
}
// Helper function to deal with remotes that are arrays
function handleArrayRemote(remote, remoteEntryExt, isRemoteGlobal) {
    const [nxRemoteProjectName, remoteLocation] = remote;
    const mfRemoteName = (0, normalize_project_name_1.normalizeProjectName)(nxRemoteProjectName);
    const finalRemoteUrl = (0, url_helpers_1.processRemoteLocation)(remoteLocation, remoteEntryExt);
    // Promise-based remotes should not use the global prefix format
    if (remoteLocation.startsWith('promise new Promise')) {
        return finalRemoteUrl;
    }
    return isRemoteGlobal ? `${mfRemoteName}@${finalRemoteUrl}` : finalRemoteUrl;
}
// Helper function to deal with remotes that are strings
function handleStringRemote(nxRemoteProjectName, determineRemoteUrl, isRemoteGlobal) {
    const globalPrefix = isRemoteGlobal
        ? `${(0, normalize_project_name_1.normalizeProjectName)(nxRemoteProjectName)}@`
        : '';
    return `${globalPrefix}${determineRemoteUrl(nxRemoteProjectName)}`;
}
/**
 * Map remote names to a format that can be understood and used by Module
 * Federation.
 *
 * @param remotes - The remotes to map
 * @param remoteEntryExt - The file extension of the remoteEntry file
 * @param determineRemoteUrl - The function used to lookup the URL of the served remote
 */
function mapRemotesForSSR(remotes, remoteEntryExt, determineRemoteUrl) {
    const mappedRemotes = {};
    for (const remote of remotes) {
        if (Array.isArray(remote)) {
            let [nxRemoteProjectName, remoteLocation] = remote;
            const mfRemoteName = (0, normalize_project_name_1.normalizeProjectName)(nxRemoteProjectName);
            const finalRemoteUrl = (0, url_helpers_1.processRemoteLocation)(remoteLocation, remoteEntryExt);
            // Promise-based remotes should not use the global prefix format
            if (remoteLocation.startsWith('promise new Promise')) {
                mappedRemotes[mfRemoteName] = finalRemoteUrl;
            }
            else {
                mappedRemotes[mfRemoteName] = `${mfRemoteName}@${finalRemoteUrl}`;
            }
        }
        else if (typeof remote === 'string') {
            const mfRemoteName = (0, normalize_project_name_1.normalizeProjectName)(remote);
            mappedRemotes[remote] = `${mfRemoteName}@${determineRemoteUrl(remote)}`;
        }
    }
    return mappedRemotes;
}
