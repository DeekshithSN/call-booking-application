"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostGenerator = hostGenerator;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const update_module_federation_project_1 = require("../../rules/update-module-federation-project");
const application_1 = tslib_1.__importDefault(require("../application/application"));
const normalize_options_1 = require("../application/lib/normalize-options");
const remote_1 = tslib_1.__importDefault(require("../remote/remote"));
const setup_ssr_1 = tslib_1.__importDefault(require("../setup-ssr/setup-ssr"));
const add_module_federation_files_1 = require("./lib/add-module-federation-files");
const normalize_remote_1 = require("../../utils/normalize-remote");
const setup_ssr_for_host_1 = require("./lib/setup-ssr-for-host");
const update_module_federation_e2e_project_1 = require("./lib/update-module-federation-e2e-project");
const add_mf_env_to_inputs_1 = require("../../utils/add-mf-env-to-inputs");
const js_1 = require("@nx/js");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const versions_1 = require("../../utils/versions");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
const update_module_federation_tsconfig_1 = require("./lib/update-module-federation-tsconfig");
const normalize_host_name_1 = require("./lib/normalize-host-name");
async function hostGenerator(host, schema) {
    const tasks = [];
    const name = await (0, normalize_host_name_1.normalizeHostName)(host, schema.directory, schema.name);
    const options = {
        ...(await (0, normalize_options_1.normalizeOptions)(host, {
            ...schema,
            name,
        })),
        js: schema.js ?? false,
        typescriptConfiguration: schema.js
            ? false
            : (schema.typescriptConfiguration ?? true),
        dynamic: schema.dynamic ?? false,
        // TODO(colum): remove when Webpack MF works with Crystal
        addPlugin: !schema.bundler || schema.bundler === 'rspack' ? true : false,
        bundler: schema.bundler ?? 'rspack',
    };
    // Check to see if remotes are provided and also check if --dynamic is provided
    // if both are check that the remotes are valid names else throw an error.
    if (options.dynamic && options.remotes?.length > 0) {
        options.remotes.forEach((remote) => {
            const isValidRemote = (0, js_1.isValidVariable)(remote);
            if (!isValidRemote.isValid) {
                throw new Error(`Invalid remote name provided: ${remote}. ${isValidRemote.message}`);
            }
        });
    }
    await (0, project_name_and_root_utils_1.ensureRootProjectName)(options, 'application');
    const initTask = await (0, application_1.default)(host, {
        ...options,
        directory: options.appProjectRoot,
        name: options.name,
        // The target use-case is loading remotes as child routes, thus always enable routing.
        routing: true,
        skipFormat: true,
    });
    tasks.push(initTask);
    // In TS solution setup, update package.json to use simple name instead of scoped name
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
        const hostPackageJsonPath = (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'package.json');
        if (host.exists(hostPackageJsonPath)) {
            (0, devkit_1.updateJson)(host, hostPackageJsonPath, (json) => {
                json.name = options.projectName;
                return json;
            });
        }
    }
    const remotesWithPorts = [];
    if (schema.remotes) {
        let remotePort = options.devServerPort + 1;
        for (const remote of schema.remotes) {
            const remoteName = await (0, normalize_remote_1.normalizeRemoteName)(host, remote, options);
            remotesWithPorts.push({ name: remoteName, port: remotePort });
            const remoteTask = await (0, remote_1.default)(host, {
                name: remote,
                directory: (0, normalize_remote_1.normalizeRemoteDirectory)(remote, options),
                style: options.style,
                unitTestRunner: options.unitTestRunner,
                e2eTestRunner: options.e2eTestRunner,
                linter: options.linter,
                devServerPort: remotePort,
                ssr: options.ssr,
                skipFormat: true,
                typescriptConfiguration: options.typescriptConfiguration,
                js: options.js,
                dynamic: options.dynamic,
                host: options.projectName,
                skipPackageJson: options.skipPackageJson,
                bundler: options.bundler,
            });
            tasks.push(remoteTask);
            remotePort++;
        }
    }
    (0, add_module_federation_files_1.addModuleFederationFiles)(host, options, remotesWithPorts);
    (0, update_module_federation_project_1.updateModuleFederationProject)(host, options, true);
    (0, update_module_federation_e2e_project_1.updateModuleFederationE2eProject)(host, options);
    (0, update_module_federation_tsconfig_1.updateModuleFederationTsconfig)(host, options);
    // Add remotes as devDependencies in TS solution setup
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host) && remotesWithPorts.length > 0) {
        addRemotesAsHostDependencies(host, options.projectName, remotesWithPorts);
    }
    if (options.ssr) {
        if (options.bundler !== 'rspack') {
            const setupSsrTask = await (0, setup_ssr_1.default)(host, {
                project: options.projectName,
                serverPort: options.devServerPort,
                skipFormat: true,
            });
            tasks.push(setupSsrTask);
        }
        const setupSsrForHostTask = await (0, setup_ssr_for_host_1.setupSsrForHost)(host, options, options.projectName, remotesWithPorts);
        tasks.push(setupSsrForHostTask);
        const projectConfig = (0, devkit_1.readProjectConfiguration)(host, options.projectName);
        if (options.bundler !== 'rspack') {
            projectConfig.targets.server.options.webpackConfig = (0, devkit_1.joinPathFragments)(projectConfig.root, `webpack.server.config.${options.typescriptConfiguration ? 'ts' : 'js'}`);
        }
        (0, devkit_1.updateProjectConfiguration)(host, options.projectName, projectConfig);
    }
    if (!options.setParserOptionsProject) {
        host.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.lint.json'));
    }
    (0, add_mf_env_to_inputs_1.addMfEnvToTargetDefaultInputs)(host, options.bundler);
    const installTask = (0, devkit_1.addDependenciesToPackageJson)(host, { '@module-federation/enhanced': versions_1.moduleFederationEnhancedVersion }, {
        '@nx/web': versions_1.nxVersion,
        '@nx/module-federation': versions_1.nxVersion,
    });
    tasks.push(installTask);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(host);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
function addRemotesAsHostDependencies(tree, hostName, remotes) {
    const hostConfig = (0, devkit_1.readProjectConfiguration)(tree, hostName);
    const hostPackageJsonPath = (0, devkit_1.joinPathFragments)(hostConfig.root, 'package.json');
    if (!tree.exists(hostPackageJsonPath)) {
        throw new Error(`Host package.json not found at ${hostPackageJsonPath}. ` +
            `TypeScript solution setup requires package.json for all projects.`);
    }
    const packageManager = (0, devkit_1.detectPackageManager)(tree.root);
    const versionSpec = packageManager === 'npm' ? '*' : 'workspace:*';
    (0, devkit_1.updateJson)(tree, hostPackageJsonPath, (json) => {
        json.devDependencies ??= {};
        for (const remote of remotes) {
            // Use simple remote name directly to match module-federation.config.ts
            json.devDependencies[remote.name] = versionSpec;
        }
        return json;
    });
}
exports.default = hostGenerator;
