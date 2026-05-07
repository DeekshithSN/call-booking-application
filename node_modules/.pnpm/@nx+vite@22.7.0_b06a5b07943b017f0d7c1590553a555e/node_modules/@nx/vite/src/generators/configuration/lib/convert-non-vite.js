"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNonVite = convertNonVite;
const devkit_1 = require("@nx/devkit");
const find_vite_config_1 = require("../../../utils/find-vite-config");
const generator_utils_1 = require("../../../utils/generator-utils");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
async function convertNonVite(tree, schema, projectRoot, _projectType, targets) {
    // Check if it has vite
    const hasViteConfig = (0, find_vite_config_1.findViteConfig)(tree, projectRoot);
    const hasIndexHtmlAtRoot = tree.exists((0, devkit_1.joinPathFragments)(projectRoot, 'index.html'));
    // Check if it has webpack
    const hasWebpackConfig = (0, find_vite_config_1.findWebpackConfig)(tree, projectRoot);
    const projectType = (0, ts_solution_setup_1.getProjectType)(tree, projectRoot, _projectType);
    if (hasWebpackConfig) {
        if (projectType === 'application') {
            (0, generator_utils_1.moveAndEditIndexHtml)(tree, schema);
        }
        (0, generator_utils_1.deleteWebpackConfig)(tree, projectRoot, hasWebpackConfig);
        (0, generator_utils_1.editTsConfig)(tree, schema);
        return;
    }
    if (projectType === 'application' &&
        hasViteConfig &&
        hasIndexHtmlAtRoot &&
        !hasWebpackConfig) {
        throw new Error(`The project ${schema.project} is already configured to use Vite.`);
        return;
    }
    if (projectType === 'library' && hasViteConfig) {
        // continue anyway - it could need to be updated - only update vite.config.ts in any case
        (0, generator_utils_1.editTsConfig)(tree, schema);
        return;
    }
    // Does the project have js executors?
    const { supported: jsTargetName, unsupported } = (0, generator_utils_1.findExistingJsBuildTargetInProject)(targets);
    if (jsTargetName) {
        (0, generator_utils_1.editTsConfig)(tree, schema);
        return;
    }
    if (unsupported) {
        throw new Error(`
      Nx cannot convert your project to use vite.
      Please try again with a different project.
    `);
    }
    // If it's a library, it's most possible it's non-buildable
    // So fix the tsconfig and return, to continue with the rest of the setup
    if (projectType === 'library' &&
        !hasViteConfig &&
        !hasWebpackConfig &&
        !jsTargetName) {
        (0, generator_utils_1.editTsConfig)(tree, schema);
        return;
    }
    /**
     * The project is an app.
     * The project has no js executors, no webpack config, no vite config.
     * We did not find any configuration that hints the project can
     * definitely be converted.
     * So, we should warn the user about it.
     * They can choose whether to convert it or not
     */
    await (0, generator_utils_1.handleUnknownConfiguration)(schema.project);
}
