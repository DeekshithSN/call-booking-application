"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAssets = normalizeAssets;
exports.getAssetOutputPath = getAssetOutputPath;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("node:path"));
const pathPosix = tslib_1.__importStar(require("node:path/posix"));
/**
 * Normalize raw asset definitions (strings or objects) into resolved
 * entries with computed input, output, and pattern fields.
 */
function normalizeAssets(assets, rootDir, projectDir, outputDir) {
    const resolvedOutputDir = path.isAbsolute(outputDir)
        ? outputDir
        : path.resolve(rootDir, outputDir);
    return assets.map((f) => {
        if (typeof f === 'string') {
            return {
                isGlob: false,
                pattern: f,
                input: path.relative(rootDir, projectDir),
                output: path.relative(rootDir, resolvedOutputDir),
                ignore: null,
                includeIgnoredFiles: undefined,
            };
        }
        return {
            isGlob: true,
            pattern: pathPosix.join(f.input, f.glob),
            input: f.input,
            output: pathPosix.join(path.relative(rootDir, resolvedOutputDir), f.output),
            ignore: f.ignore
                ? f.ignore.map((ig) => pathPosix.join(f.input, ig))
                : null,
            includeIgnoredFiles: f.includeIgnoredFiles,
        };
    });
}
/**
 * Compute the output path for a file given its asset entry,
 * matching the dest logic used during file copying.
 */
function getAssetOutputPath(src, assetEntry) {
    const relPath = path.relative(assetEntry.input, src);
    const dest = relPath.startsWith('..') ? src : relPath;
    return pathPosix.join(assetEntry.output, dest);
}
