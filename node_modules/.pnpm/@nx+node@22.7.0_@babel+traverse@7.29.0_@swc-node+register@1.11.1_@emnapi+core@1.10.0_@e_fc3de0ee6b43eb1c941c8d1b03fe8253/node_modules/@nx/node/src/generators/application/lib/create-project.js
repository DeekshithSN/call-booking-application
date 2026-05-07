"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProject = addProject;
const devkit_1 = require("@nx/devkit");
const target_defaults_utils_1 = require("@nx/devkit/src/generators/target-defaults-utils");
const has_webpack_plugin_1 = require("../../../utils/has-webpack-plugin");
const create_targets_1 = require("./create-targets");
function addProject(tree, options, frameworkDependencies) {
    const project = {
        root: options.appProjectRoot,
        sourceRoot: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src'),
        projectType: 'application',
        targets: {},
        tags: options.parsedTags,
    };
    if (options.bundler === 'esbuild') {
        (0, target_defaults_utils_1.addBuildTargetDefaults)(tree, '@nx/esbuild:esbuild');
        project.targets.build = (0, create_targets_1.getEsBuildConfig)(tree, project, options);
    }
    else if (options.bundler === 'webpack') {
        if (!(0, has_webpack_plugin_1.hasWebpackPlugin)(tree) && options.addPlugin === false) {
            (0, target_defaults_utils_1.addBuildTargetDefaults)(tree, `@nx/webpack:webpack`);
            project.targets.build = (0, create_targets_1.getWebpackBuildConfig)(tree, project, options);
        }
        else if (options.isNest) {
            // If we are using Nest that has the webpack plugin we need to override the
            // build target so that node-env can be set to production or development so the serve target can be run in development mode
            project.targets.build = (0, create_targets_1.getNestWebpackBuildConfig)(project);
        }
    }
    project.targets = {
        ...project.targets,
        ...(0, create_targets_1.getPruneTargets)('build', options.outputPath),
    };
    project.targets.serve = (0, create_targets_1.getServeConfig)(options);
    const packageJson = {
        name: options.importPath,
        version: '0.0.1',
        private: true,
        dependencies: { ...frameworkDependencies },
    };
    if (!options.useProjectJson) {
        packageJson.nx = {
            name: options.name !== options.importPath ? options.name : undefined,
            targets: project.targets,
            tags: project.tags?.length ? project.tags : undefined,
        };
    }
    else {
        (0, devkit_1.addProjectConfiguration)(tree, options.name, project, options.standaloneConfig);
    }
    if (!options.useProjectJson || options.isUsingTsSolutionConfig) {
        (0, devkit_1.writeJson)(tree, (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'package.json'), packageJson);
    }
}
