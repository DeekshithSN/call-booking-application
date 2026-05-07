"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSsrForRemote = setupSsrForRemote;
const devkit_1 = require("@nx/devkit");
const devkit_2 = require("@nx/devkit");
const versions_1 = require("../../../utils/versions");
const create_application_files_1 = require("../../application/lib/create-application-files");
async function setupSsrForRemote(tree, options, appName) {
    const tasks = [];
    const project = (0, devkit_2.readProjectConfiguration)(tree, appName);
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
        }
        : {
            ...options,
            port: Number(options?.devServerPort) || 4200,
            appName,
            tmpl: '',
            browserBuildOutputPath: project.targets.build?.options?.outputPath,
            serverBuildOutputPath: project.targets.server?.options?.outputPath,
        };
    (0, devkit_2.generateFiles)(tree, (0, devkit_2.joinPathFragments)(__dirname, `../files/${pathToModuleFederationSsrFiles}`), project.root, templateVariables);
    // For hosts to use when running remotes in static mode.
    const originalOutputPath = (project.targets.build?.options?.outputPath ??
        options.isUsingTsSolutionConfig)
        ? 'dist'
        : (0, devkit_2.joinPathFragments)((0, devkit_1.offsetFromRoot)(options.appProjectRoot), 'dist', options.appProjectRoot != '.'
            ? options.appProjectRoot
            : options.projectName);
    const serverOptions = project.targets.server?.options;
    const serverOutputPath = serverOptions?.outputPath ??
        (0, devkit_2.joinPathFragments)(originalOutputPath, 'server');
    const serverOutputName = serverOptions?.outputFileName ?? 'main.js';
    project.targets['serve-static'] = {
        dependsOn: ['build', 'server'],
        executor: 'nx:run-commands',
        defaultConfiguration: 'development',
        options: {
            command: `PORT=${options.devServerPort ?? 4200} node ${(0, devkit_2.joinPathFragments)(serverOutputPath, serverOutputName)}`,
        },
    };
    (0, devkit_2.updateProjectConfiguration)(tree, appName, project);
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
