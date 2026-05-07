"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSsrForHost = setupSsrForHost;
const devkit_1 = require("@nx/devkit");
const devkit_2 = require("@nx/devkit");
const versions_1 = require("../../../utils/versions");
const create_application_files_1 = require("../../application/lib/create-application-files");
async function setupSsrForHost(tree, options, appName, defaultRemoteManifest) {
    const tasks = [];
    let project = (0, devkit_2.readProjectConfiguration)(tree, appName);
    if (options.bundler !== 'rspack') {
        project.targets.serve.executor =
            '@nx/react:module-federation-ssr-dev-server';
        (0, devkit_2.updateProjectConfiguration)(tree, appName, project);
    }
    const pathToModuleFederationSsrFiles = options.typescriptConfiguration
        ? `${options.bundler === 'rspack' ? 'rspack-' : 'webpack-'}module-federation-ssr-ts`
        : `${options.bundler === 'rspack' ? 'rspack-' : 'webpack-'}module-federation-ssr`;
    const templateVariables = options.bundler === 'rspack'
        ? {
            ...(0, create_application_files_1.getDefaultTemplateVariables)(tree, options),
            rspackPluginOptions: {
                ...(0, create_application_files_1.createNxRspackPluginOptions)(options, (0, devkit_1.offsetFromRoot)(options.appProjectRoot), false),
                mainServer: `./server.ts`,
            },
            port: Number(options?.devServerPort) || 4200,
            appName,
            static: !options?.dynamic,
            remotes: defaultRemoteManifest.map(({ name, port }) => {
                return {
                    ...(0, devkit_2.names)(name),
                    port,
                };
            }),
        }
        : {
            ...options,
            static: !options?.dynamic,
            port: Number(options?.devServerPort) || 4200,
            appName,
            tmpl: '',
            browserBuildOutputPath: project.targets.build?.options?.outputPath,
            remotes: defaultRemoteManifest.map(({ name, port }) => {
                return {
                    ...(0, devkit_2.names)(name),
                    port,
                };
            }),
        };
    (0, devkit_2.generateFiles)(tree, (0, devkit_2.joinPathFragments)(__dirname, `../files/${pathToModuleFederationSsrFiles}`), project.root, templateVariables);
    const installTask = (0, devkit_2.addDependenciesToPackageJson)(tree, {
        '@module-federation/node': versions_1.moduleFederationNodeVersion,
        cors: versions_1.corsVersion,
        isbot: versions_1.isbotVersion,
        express: versions_1.expressVersion,
        '@types/express': versions_1.typesExpressVersion,
    }, {});
    tasks.push(installTask);
    return (0, devkit_2.runTasksInSerial)(...tasks);
}
