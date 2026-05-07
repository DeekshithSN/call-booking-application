"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addModuleFederationFiles = addModuleFederationFiles;
const devkit_1 = require("@nx/devkit");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const maybe_js_1 = require("../../../utils/maybe-js");
const create_application_files_1 = require("../../application/lib/create-application-files");
const path_1 = require("path");
function addModuleFederationFiles(host, options, defaultRemoteManifest) {
    const templateVariables = options.bundler === 'rspack'
        ? {
            ...(0, create_application_files_1.getDefaultTemplateVariables)(host, options),
            rspackPluginOptions: {
                ...(0, create_application_files_1.createNxRspackPluginOptions)(options, (0, devkit_1.offsetFromRoot)(options.appProjectRoot), false),
                mainServer: `./server.ts`,
            },
            static: !options?.dynamic,
            remotes: defaultRemoteManifest.map(({ name, port }) => {
                return {
                    ...(0, devkit_1.names)(name),
                    port,
                };
            }),
        }
        : {
            ...(0, devkit_1.names)(options.projectName),
            ...options,
            static: !options?.dynamic,
            tmpl: '',
            remotes: defaultRemoteManifest.map(({ name, port }) => {
                return {
                    ...(0, devkit_1.names)(name),
                    port,
                };
            }),
        };
    const projectConfig = (0, devkit_1.readProjectConfiguration)(host, options.projectName);
    const pathToMFManifest = (0, devkit_1.joinPathFragments)((0, ts_solution_setup_1.getProjectSourceRoot)(projectConfig, host), 'assets/module-federation.manifest.json');
    // Module federation requires bootstrap code to be dynamically imported.
    // Renaming original entry file so we can use `import(./bootstrap)` in
    // new entry file.
    host.rename((0, devkit_1.joinPathFragments)(options.appProjectRoot, (0, maybe_js_1.maybeJs)({ js: options.js, useJsx: options.bundler === 'rspack' }, 'src/main.tsx')), (0, devkit_1.joinPathFragments)(options.appProjectRoot, (0, maybe_js_1.maybeJs)({ js: options.js, useJsx: options.bundler === 'rspack' }, 'src/bootstrap.tsx')));
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, `../files/${options.js
        ? options.bundler === 'rspack'
            ? 'rspack-common'
            : 'common'
        : 'common-ts'}`), options.appProjectRoot, templateVariables);
    const pathToModuleFederationFiles = options.typescriptConfiguration
        ? `${options.bundler === 'rspack' ? 'rspack-' : 'webpack-'}module-federation-ts`
        : `${options.bundler === 'rspack' ? 'rspack-' : 'webpack-'}module-federation`;
    // New entry file is created here.
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, `../files/${pathToModuleFederationFiles}`), options.appProjectRoot, templateVariables);
    function deleteFileIfExists(host, filePath) {
        if (host.exists(filePath)) {
            host.delete(filePath);
        }
    }
    function processBundlerConfigFile(options, host, fileName) {
        const pathToBundlerConfig = (0, devkit_1.joinPathFragments)(options.appProjectRoot, fileName);
        deleteFileIfExists(host, pathToBundlerConfig);
    }
    if (options.typescriptConfiguration) {
        if (options.bundler === 'rspack') {
            processBundlerConfigFile(options, host, 'rspack.config.js');
            processBundlerConfigFile(options, host, 'rspack.config.prod.js');
        }
        else {
            processBundlerConfigFile(options, host, 'webpack.config.js');
            processBundlerConfigFile(options, host, 'webpack.config.prod.js');
        }
        // Delete TypeScript prod config in TS solution setup - not needed in Crystal
        if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
            const prodConfigFileName = options.bundler === 'rspack'
                ? 'rspack.config.prod.ts'
                : 'webpack.config.prod.ts';
            processBundlerConfigFile(options, host, prodConfigFileName);
        }
    }
    if (options.dynamic) {
        processBundlerConfigFile(options, host, 'webpack.config.prod.js');
        processBundlerConfigFile(options, host, 'webpack.config.prod.ts');
        processBundlerConfigFile(options, host, 'rspack.config.prod.js');
        processBundlerConfigFile(options, host, 'rspack.config.prod.ts');
        if (!host.exists(pathToMFManifest)) {
            host.write(pathToMFManifest, `{
        ${defaultRemoteManifest
                .map(({ name, port }) => `"${name}": "http://localhost:${port}/mf-manifest.json"`)
                .join(',\n')}
          }`);
        }
    }
}
