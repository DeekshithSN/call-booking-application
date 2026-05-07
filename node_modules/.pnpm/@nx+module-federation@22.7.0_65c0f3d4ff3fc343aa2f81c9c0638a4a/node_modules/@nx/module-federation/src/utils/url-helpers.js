"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAbsoluteUrl = isAbsoluteUrl;
exports.processRemoteLocation = processRemoteLocation;
exports.processRuntimeRemoteUrl = processRuntimeRemoteUrl;
const path_1 = require("path");
/**
 * Checks if a URL string is absolute (has protocol)
 */
function isAbsoluteUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Safely processes remote locations, handling both relative and absolute URLs
 * while preserving query parameters and hash fragments for absolute URLs
 */
function processRemoteLocation(remoteLocation, remoteEntryExt) {
    // Handle promise-based remotes as-is
    if (remoteLocation.startsWith('promise new Promise')) {
        return remoteLocation;
    }
    if (isAbsoluteUrl(remoteLocation)) {
        // Use new URL parsing for absolute URLs (supports query params/hash)
        const url = new URL(remoteLocation);
        const ext = (0, path_1.extname)(url.pathname);
        const needsRemoteEntry = !['.js', '.mjs', '.json'].includes(ext);
        if (needsRemoteEntry) {
            url.pathname = url.pathname.endsWith('/')
                ? `${url.pathname}remoteEntry.${remoteEntryExt}`
                : `${url.pathname}/remoteEntry.${remoteEntryExt}`;
        }
        return url.href;
    }
    else {
        // Use string manipulation for relative URLs (backward compatibility)
        const ext = (0, path_1.extname)(remoteLocation);
        const needsRemoteEntry = !['.js', '.mjs', '.json'].includes(ext);
        if (needsRemoteEntry) {
            const baseRemote = remoteLocation.endsWith('/')
                ? remoteLocation.slice(0, -1)
                : remoteLocation;
            return `${baseRemote}/remoteEntry.${remoteEntryExt}`;
        }
        return remoteLocation;
    }
}
/**
 * Processes remote URLs for runtime environments, resolving relative URLs against window.location.origin
 */
function processRuntimeRemoteUrl(remoteUrl, remoteEntryExt) {
    if (isAbsoluteUrl(remoteUrl)) {
        return processRemoteLocation(remoteUrl, remoteEntryExt);
    }
    else {
        // For runtime relative URLs, resolve against current origin
        const baseUrl = typeof globalThis !== 'undefined' &&
            typeof globalThis.window !== 'undefined' &&
            globalThis.window.location
            ? globalThis.window.location.origin
            : 'http://localhost';
        const absoluteUrl = new URL(remoteUrl, baseUrl).href;
        return processRemoteLocation(absoluteUrl, remoteEntryExt);
    }
}
