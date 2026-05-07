"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModuleFederationProject = updateModuleFederationProject;
const devkit_1 = require("@nx/devkit");
const maybe_js_1 = require("../utils/maybe-js");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
function updateModuleFederationProject(host, options, isHost = false) {
    const projectConfig = (0, devkit_1.readProjectConfiguration)(host, options.projectName);
    projectConfig.targets ??= {};
    if (options.bundler !== 'rspack') {
        projectConfig.targets.build.options = {
            ...(projectConfig.targets.build.options ?? {}),
            main: (0, maybe_js_1.maybeJs)(options, `${options.appProjectRoot}/src/main.ts`),
            webpackConfig: `${options.appProjectRoot}/webpack.config.${options.typescriptConfiguration && !options.js ? 'ts' : 'js'}`,
        };
        projectConfig.targets.build.configurations ??= {};
        if (!(0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
            projectConfig.targets.build.configurations.production = {
                ...(projectConfig.targets.build.configurations?.production ?? {}),
                webpackConfig: `${options.appProjectRoot}/webpack.config.prod.${options.typescriptConfiguration && !options.js ? 'ts' : 'js'}`,
            };
        }
    }
    // If host should be configured to use dynamic federation
    if (options.dynamic) {
        if (options.bundler !== 'rspack') {
            const pathToProdWebpackConfig = (0, devkit_1.joinPathFragments)(projectConfig.root, `webpack.prod.config.${options.typescriptConfiguration && !options.js ? 'ts' : 'js'}`);
            if (host.exists(pathToProdWebpackConfig)) {
                host.delete(pathToProdWebpackConfig);
            }
            delete projectConfig.targets.build.configurations.production
                ?.webpackConfig;
        }
    }
    if (options.bundler !== 'rspack') {
        projectConfig.targets.serve.executor =
            '@nx/react:module-federation-dev-server';
    }
    projectConfig.targets.serve ??= {};
    projectConfig.targets.serve.options ??= {};
    projectConfig.targets.serve.options.port =
        options.bundler === 'rspack' && options.ssr && isHost
            ? 4000
            : options.devServerPort;
    // `serve-static` for remotes that don't need to be in development mode
    if (options.bundler !== 'rspack') {
        const serveStaticExecutor = '@nx/react:module-federation-static-server';
        projectConfig.targets['serve-static'] = {
            executor: serveStaticExecutor,
            defaultConfiguration: 'production',
            options: {
                serveTarget: `${options.projectName}:serve`,
            },
            configurations: {
                development: {
                    serveTarget: `${options.projectName}:serve:development`,
                },
                production: {
                    serveTarget: `${options.projectName}:serve:production`,
                },
            },
        };
    }
    // Typechecks must be performed first before build and serve to generate remote d.ts files.
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
        projectConfig.targets.build ??= {};
        projectConfig.targets.serve ??= {};
        projectConfig.targets.build.dependsOn = ['^build', 'typecheck'];
        projectConfig.targets.serve.dependsOn = ['typecheck'];
    }
    (0, devkit_1.updateProjectConfiguration)(host, options.projectName, projectConfig);
}
