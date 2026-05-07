"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolateVersionPattern = interpolateVersionPattern;
const git_utils_1 = require("nx/src/utils/git-utils");
const interpolate_pattern_1 = require("../utils/interpolate-pattern");
function interpolateVersionPattern(versionPattern, data) {
    const commitSha = (0, git_utils_1.getLatestCommitSha)();
    const substitutions = {
        projectName: data.projectName ?? '',
        currentDate: data.currentDate ?? new Date(),
        commitSha: data.commitSha ?? commitSha,
        shortCommitSha: data.shortCommitSha ?? commitSha.slice(0, 7),
        versionActionsVersion: data.versionActionsVersion ?? '',
    };
    return (0, interpolate_pattern_1.interpolatePattern)(versionPattern, substitutions);
}
