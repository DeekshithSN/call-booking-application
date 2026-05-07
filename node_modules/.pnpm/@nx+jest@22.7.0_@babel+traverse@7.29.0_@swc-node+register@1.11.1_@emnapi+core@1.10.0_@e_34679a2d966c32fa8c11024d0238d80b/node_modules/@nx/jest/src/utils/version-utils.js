"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledJestVersion = getInstalledJestVersion;
exports.getInstalledJestMajorVersion = getInstalledJestMajorVersion;
const jest_1 = require("jest");
const semver_1 = require("semver");
function getInstalledJestVersion() {
    try {
        return (0, jest_1.getVersion)();
    }
    catch {
        return null;
    }
}
function getInstalledJestMajorVersion() {
    const installedVersion = getInstalledJestVersion();
    return installedVersion ? (0, semver_1.major)(installedVersion) : null;
}
