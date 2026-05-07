"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePathOptions = normalizePathOptions;
const devkit_1 = require("@nx/devkit");
const executorPathFieldsToMigrate = [
    'tsConfig',
    'project',
    'main',
    'outputPath',
    'rollupConfig',
    'additionalEntryPoints',
];
function normalizePathOptions(projectRoot, options) {
    for (const [key, value] of Object.entries(options)) {
        if (!executorPathFieldsToMigrate.includes(key))
            continue;
        if (Array.isArray(value)) {
            options[key] = value.map((v) => normalizeValue(projectRoot, key, v));
        }
        else {
            options[key] = normalizeValue(projectRoot, key, value);
        }
    }
}
function normalizeValue(projectRoot, key, value) {
    // Logic matches `@nx/rollup:rollup` in `normalizePluginPath` function.
    if (!value)
        return value;
    if (key === 'rollupConfig') {
        try {
            // If this can load as npm module, keep as is.
            require.resolve(value);
            return value;
        }
        catch {
            // Otherwise continue below convert to relative path from project.
        }
    }
    if (value.startsWith(`${projectRoot}/`)) {
        return value.replace(new RegExp(`^${projectRoot}/`), './');
    }
    else {
        return (0, devkit_1.joinPathFragments)((0, devkit_1.offsetFromRoot)(projectRoot), value);
    }
}
