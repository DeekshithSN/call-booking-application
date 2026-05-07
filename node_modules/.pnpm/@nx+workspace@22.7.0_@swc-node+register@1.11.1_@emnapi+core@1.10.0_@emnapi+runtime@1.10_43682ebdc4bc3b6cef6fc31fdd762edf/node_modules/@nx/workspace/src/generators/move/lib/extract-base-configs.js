"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeExtractTsConfigBase = maybeExtractTsConfigBase;
exports.maybeExtractJestConfigBase = maybeExtractJestConfigBase;
exports.maybeMigrateEslintConfigIfRootProject = maybeMigrateEslintConfigIfRootProject;
const devkit_1 = require("@nx/devkit");
const jest_config_1 = require("../../utils/jest-config");
function maybeExtractTsConfigBase(tree) {
    let extractTsConfigBase;
    try {
        extractTsConfigBase = require('@nx/' + 'js').extractTsConfigBase;
    }
    catch {
        // Not installed, skip
        return;
    }
    extractTsConfigBase(tree);
}
async function maybeExtractJestConfigBase(tree) {
    let jestInitGenerator;
    try {
        jestInitGenerator = require('@nx/' + 'jest').jestInitGenerator;
    }
    catch {
        // Not installed, skip
        return;
    }
    await jestInitGenerator(tree, {});
}
function maybeMigrateEslintConfigIfRootProject(tree, rootProject) {
    let migrateConfigToMonorepoStyle;
    try {
        migrateConfigToMonorepoStyle = require('@nx/' + 'eslint/src/generators/init/init-migration').migrateConfigToMonorepoStyle;
    }
    catch {
        // eslint not installed
    }
    migrateConfigToMonorepoStyle?.(Array.from((0, devkit_1.getProjects)(tree).values()), tree, (0, jest_config_1.findProjectJestConfig)(tree, rootProject.root) ? 'jest' : 'none');
}
