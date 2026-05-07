"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addModuleFederationFiles = addModuleFederationFiles;
exports.remoteGenerator = remoteGenerator;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
const js_1 = require("@nx/js");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const update_module_federation_project_1 = require("../../rules/update-module-federation-project");
const add_mf_env_to_inputs_1 = require("../../utils/add-mf-env-to-inputs");
const normalize_remote_1 = require("../../utils/normalize-remote");
const maybe_js_1 = require("../../utils/maybe-js");
const versions_1 = require("../../utils/versions");
const application_1 = tslib_1.__importDefault(require("../application/application"));
const create_application_files_1 = require("../application/lib/create-application-files");
const normalize_options_1 = require("../application/lib/normalize-options");
const setup_ssr_1 = tslib_1.__importDefault(require("../setup-ssr/setup-ssr"));
const add_remote_to_dynamic_host_1 = require("./lib/add-remote-to-dynamic-host");
const setup_package_json_exports_for_remote_1 = require("./lib/setup-package-json-exports-for-remote");
const setup_ssr_for_remote_1 = require("./lib/setup-ssr-for-remote");
const setup_tspath_for_remote_1 = require("./lib/setup-tspath-for-remote");
const update_host_with_remote_1 = require("./lib/update-host-with-remote");
function addModuleFederationFiles(host, options) {
    const templateVariables = options.bundler === 'rspack'
        ? {
            ...(0, create_application_files_1.getDefaultTemplateVariables)(host, options),
            rspackPluginOptions: {
                ...(0, create_application_files_1.createNxRspackPluginOptions)(options, (0, devkit_1.offsetFromRoot)(options.appProjectRoot), false),
                mainServer: `./server.ts`,
            },
        }
        : {
            ...(0, devkit_1.names)(options.projectName),
            ...options,
            tmpl: '',
        };
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, `./files/${options.js
        ? options.bundler === 'rspack'
            ? 'rspack-common'
            : 'common'
        : 'common-ts'}`), options.appProjectRoot, templateVariables);
    const pathToModuleFederationFiles = options.typescriptConfiguration
        ? `${options.bundler === 'rspack' ? 'rspack-' : 'webpack-'}module-federation-ts`
        : `${options.bundler === 'rspack' ? 'rspack-' : 'webpack-'}module-federation`;
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, `./files/${pathToModuleFederationFiles}`), options.appProjectRoot, templateVariables);
    if (options.typescriptConfiguration) {
        const pathToBundlerConfig = (0, devkit_1.joinPathFragments)(options.appProjectRoot, options.bundler === 'rspack' ? 'rspack.config.js' : 'webpack.config.js');
        const pathToWebpackProdConfig = (0, devkit_1.joinPathFragments)(options.appProjectRoot, options.bundler === 'rspack'
            ? 'rspack.config.prod.js'
            : 'webpack.config.prod.js');
        if (host.exists(pathToBundlerConfig)) {
            host.delete(pathToBundlerConfig);
        }
        if (host.exists(pathToWebpackProdConfig)) {
            host.delete(pathToWebpackProdConfig);
        }
        // Delete TypeScript prod config in TS solution setup - not needed in Crystal
        if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
            const pathToTsProdConfig = (0, devkit_1.joinPathFragments)(options.appProjectRoot, options.bundler === 'rspack'
                ? 'rspack.config.prod.ts'
                : 'webpack.config.prod.ts');
            if (host.exists(pathToTsProdConfig)) {
                host.delete(pathToTsProdConfig);
            }
        }
    }
}
async function remoteGenerator(host, schema) {
    const tasks = [];
    const name = await (0, normalize_remote_1.normalizeRemoteName)(host, schema.name, schema);
    const options = {
        ...(await (0, normalize_options_1.normalizeOptions)(host, {
            ...schema,
            name,
        })),
        // when js is set to true, we want to use the js configuration
        js: schema.js ?? false,
        typescriptConfiguration: schema.js
            ? false
            : (schema.typescriptConfiguration ?? true),
        dynamic: schema.dynamic ?? false,
        // TODO(colum): remove when Webpack MF works with Crystal
        addPlugin: !schema.bundler || schema.bundler === 'rspack' ? true : false,
        bundler: schema.bundler ?? 'rspack',
    };
    if (options.dynamic) {
        // Dynamic remotes generate with library { type: 'var' } by default.
        // We need to ensure that the remote name is a valid variable name.
        const isValidRemote = (0, js_1.isValidVariable)(options.projectName);
        if (!isValidRemote.isValid) {
            throw new Error(`Invalid remote name provided: ${options.projectName}. ${isValidRemote.message}`);
        }
    }
    await (0, project_name_and_root_utils_1.ensureRootProjectName)(options, 'application');
    const isValidRemote = (0, js_1.isValidVariable)(options.projectName);
    if (!isValidRemote.isValid) {
        throw new Error(`Invalid remote name provided: ${options.projectName}. ${isValidRemote.message}`);
    }
    const initAppTask = await (0, application_1.default)(host, {
        ...options,
        name: options.projectName,
        skipFormat: true,
    });
    tasks.push(initAppTask);
    // In TS solution setup, update package.json to use simple name instead of scoped name
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
        const remotePackageJsonPath = (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'package.json');
        if (host.exists(remotePackageJsonPath)) {
            (0, devkit_1.updateJson)(host, remotePackageJsonPath, (json) => {
                json.name = options.projectName;
                return json;
            });
        }
    }
    if (options.host) {
        (0, update_host_with_remote_1.updateHostWithRemote)(host, options.host, options.projectName);
    }
    // Module federation requires bootstrap code to be dynamically imported.
    // Renaming original entry file so we can use `import(./bootstrap)` in
    // new entry file.
    host.rename((0, path_1.join)(options.appProjectRoot, (0, maybe_js_1.maybeJs)({ js: options.js, useJsx: options.bundler === 'rspack' }, 'src/main.tsx')), (0, path_1.join)(options.appProjectRoot, (0, maybe_js_1.maybeJs)({ js: options.js, useJsx: options.bundler === 'rspack' }, 'src/bootstrap.tsx')));
    addModuleFederationFiles(host, options);
    (0, update_module_federation_project_1.updateModuleFederationProject)(host, options);
    // Conditionally setup TS path or package.json exports based on TS solution setup
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
        (0, setup_package_json_exports_for_remote_1.setupPackageJsonExportsForRemote)(host, options);
    }
    else {
        (0, setup_tspath_for_remote_1.setupTspathForRemote)(host, options);
    }
    if (options.ssr) {
        if (options.bundler !== 'rspack') {
            const setupSsrTask = await (0, setup_ssr_1.default)(host, {
                project: options.projectName,
                serverPort: options.devServerPort,
                skipFormat: true,
                bundler: options.bundler,
            });
            tasks.push(setupSsrTask);
        }
        const setupSsrForRemoteTask = await (0, setup_ssr_for_remote_1.setupSsrForRemote)(host, options, options.projectName);
        tasks.push(setupSsrForRemoteTask);
        const projectConfig = (0, devkit_1.readProjectConfiguration)(host, options.projectName);
        if (options.bundler !== 'rspack') {
            projectConfig.targets.server.options.webpackConfig = (0, devkit_1.joinPathFragments)(projectConfig.root, `webpack.server.config.${options.typescriptConfiguration ? 'ts' : 'js'}`);
            (0, devkit_1.updateProjectConfiguration)(host, options.projectName, projectConfig);
        }
    }
    if (!options.setParserOptionsProject) {
        host.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.lint.json'));
    }
    if (options.host && options.bundler === 'rspack') {
        const projectConfig = (0, devkit_1.readProjectConfiguration)(host, options.projectName);
        projectConfig.targets.serve ??= {};
        projectConfig.targets.serve.dependsOn ??= [];
        projectConfig.targets.serve.dependsOn.push(`${options.host}:serve`);
        (0, devkit_1.updateProjectConfiguration)(host, options.projectName, projectConfig);
    }
    if (options.host && options.dynamic) {
        const hostConfig = (0, devkit_1.readProjectConfiguration)(host, schema.host);
        const pathToMFManifest = (0, devkit_1.joinPathFragments)((0, ts_solution_setup_1.getProjectSourceRoot)(hostConfig, host), 'assets/module-federation.manifest.json');
        (0, add_remote_to_dynamic_host_1.addRemoteToDynamicHost)(host, options.projectName, options.devServerPort, pathToMFManifest);
    }
    (0, add_mf_env_to_inputs_1.addMfEnvToTargetDefaultInputs)(host, options.bundler);
    const installTask = (0, devkit_1.addDependenciesToPackageJson)(host, {}, {
        '@module-federation/enhanced': versions_1.moduleFederationEnhancedVersion,
        '@nx/web': versions_1.nxVersion,
        '@nx/module-federation': versions_1.nxVersion,
    });
    tasks.push(installTask);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(host);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = remoteGenerator;
