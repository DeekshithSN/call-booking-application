"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHostWithRemote = updateHostWithRemote;
const devkit_1 = require("@nx/devkit");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const ast_utils_1 = require("../../../module-federation/ast-utils");
let tsModule;
function updateHostWithRemote(host, hostName, remoteName) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const hostConfig = (0, devkit_1.readProjectConfiguration)(host, hostName);
    let moduleFederationConfigPath = (0, devkit_1.joinPathFragments)(hostConfig.root, 'module-federation.config.js');
    if (!host.exists(moduleFederationConfigPath)) {
        moduleFederationConfigPath = (0, devkit_1.joinPathFragments)(hostConfig.root, 'module-federation.config.ts');
    }
    const appComponentPath = findAppComponentPath(host, (0, ts_solution_setup_1.getProjectSourceRoot)(hostConfig, host));
    if (host.exists(moduleFederationConfigPath)) {
        // find the host project path
        // Update remotes inside ${host_path}/src/remotes.d.ts
        let sourceCode = host.read(moduleFederationConfigPath).toString();
        const source = tsModule.createSourceFile(moduleFederationConfigPath, sourceCode, tsModule.ScriptTarget.Latest, true);
        host.write(moduleFederationConfigPath, (0, devkit_1.applyChangesToString)(sourceCode, (0, ast_utils_1.addRemoteToConfig)(source, remoteName)));
    }
    else {
        // TODO(jack): Point to the nx.dev guide when ready.
        devkit_1.logger.warn(`Could not find configuration at ${moduleFederationConfigPath}. Did you generate this project with "@nx/react:host" or "@nx/react:consumer"?`);
    }
    if (host.exists(appComponentPath)) {
        let sourceCode = host.read(appComponentPath).toString();
        const source = tsModule.createSourceFile(moduleFederationConfigPath, sourceCode, tsModule.ScriptTarget.Latest, true, tsModule.ScriptKind.TSX);
        host.write(appComponentPath, (0, devkit_1.applyChangesToString)(sourceCode, (0, ast_utils_1.addRemoteRoute)(source, (0, devkit_1.names)(remoteName))));
    }
    else {
        devkit_1.logger.warn(`Could not find app component at ${appComponentPath}. Did you generate this project with "@nx/react:host" or "@nx/react:consumer"?`);
    }
    // Add remote as devDependency in TS solution setup
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
        addRemoteAsHostDependency(host, hostName, remoteName);
    }
}
function findAppComponentPath(host, sourceRoot) {
    const locations = [
        'app/app.tsx',
        'app/App.tsx',
        'app/app.js',
        'app/app.jsx',
        'app/App.js',
        'app/App.jsx',
        'app.tsx',
        'App.tsx',
        'app.js',
        'App.js',
        'app.jsx',
        'App.jsx',
    ];
    for (const loc of locations) {
        if (host.exists((0, devkit_1.joinPathFragments)(sourceRoot, loc))) {
            return (0, devkit_1.joinPathFragments)(sourceRoot, loc);
        }
    }
}
function addRemoteAsHostDependency(tree, hostName, remoteName) {
    const hostConfig = (0, devkit_1.readProjectConfiguration)(tree, hostName);
    const hostPackageJsonPath = (0, devkit_1.joinPathFragments)(hostConfig.root, 'package.json');
    if (!tree.exists(hostPackageJsonPath)) {
        throw new Error(`Host package.json not found at ${hostPackageJsonPath}. ` +
            `TypeScript solution setup requires package.json for all projects.`);
    }
    const packageManager = (0, devkit_1.detectPackageManager)(tree.root);
    // npm doesn't support workspace: protocol, use * instead
    const versionSpec = packageManager === 'npm' ? '*' : 'workspace:*';
    (0, devkit_1.updateJson)(tree, hostPackageJsonPath, (json) => {
        json.devDependencies ??= {};
        // Use simple remote name directly to match module-federation.config.ts
        json.devDependencies[remoteName] = versionSpec;
        return json;
    });
}
