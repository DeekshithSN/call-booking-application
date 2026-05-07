"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareWorkspaceLibraries = shareWorkspaceLibraries;
exports.getNpmPackageSharedConfig = getNpmPackageSharedConfig;
exports.sharePackages = sharePackages;
exports.applySharedFunction = applySharedFunction;
exports.applyAdditionalShared = applyAdditionalShared;
const path_1 = require("path");
const package_json_1 = require("./package-json");
const typescript_1 = require("./typescript");
const secondary_entry_points_1 = require("./secondary-entry-points");
const devkit_1 = require("@nx/devkit");
const fs_1 = require("fs");
const core_1 = require("@rspack/core");
/**
 * Checks if a version string is a workspace protocol version that needs normalization.
 * This includes pnpm workspace protocol (workspace:*), file: protocol, or bare *.
 */
function isWorkspaceProtocolVersion(version) {
    if (!version)
        return false;
    return (version === '*' ||
        version.startsWith('workspace:') ||
        version.startsWith('file:'));
}
/**
 * Normalizes workspace protocol versions (workspace:*, workspace:^, *, file:) to actual semver versions
 * by looking up the version from the library's package.json.
 *
 * @param version - The version string that may contain workspace protocol
 * @param libraryName - The name of the library to look up
 * @param workspaceLibs - The workspace libraries to search in
 * @returns The normalized version string, or null if it cannot be resolved
 */
function normalizeWorkspaceProtocolVersion(version, libraryName, workspaceLibs) {
    if (!isWorkspaceProtocolVersion(version)) {
        return version;
    }
    // Look up the actual version from the library's package.json
    const workspaceLib = workspaceLibs.find((lib) => lib.importKey === libraryName);
    if (workspaceLib) {
        const libPackageJsonPath = (0, path_1.join)(devkit_1.workspaceRoot, workspaceLib.root, 'package.json');
        if ((0, fs_1.existsSync)(libPackageJsonPath)) {
            const libPkgJson = (0, devkit_1.readJsonFile)(libPackageJsonPath);
            if (libPkgJson?.version) {
                return libPkgJson.version;
            }
        }
    }
    // Can't resolve the actual version, return null to indicate no version requirement
    return null;
}
/**
 * Build an object of functions to be used with the ModuleFederationPlugin to
 * share Nx Workspace Libraries between Hosts and Remotes.
 *
 * @param workspaceLibs - The Nx Workspace Libraries to share
 * @param tsConfigPath - The path to TS Config File that contains the Path Mappings for the Libraries
 * @param bundler - The bundler to use for the replacement plugin
 */
function shareWorkspaceLibraries(workspaceLibs, tsConfigPath = process.env.NX_TSCONFIG_PATH ?? (0, typescript_1.getRootTsConfigPath)(), bundler = 'rspack') {
    if (!workspaceLibs) {
        return getEmptySharedLibrariesConfig();
    }
    const tsconfigPathAliases = (0, typescript_1.readTsPathMappings)(tsConfigPath);
    // Nested projects must come first, sort them as such
    const sortedTsConfigPathAliases = {};
    Object.keys(tsconfigPathAliases)
        .sort((a, b) => {
        return b.split('/').length - a.split('/').length;
    })
        .forEach((key) => (sortedTsConfigPathAliases[key] = tsconfigPathAliases[key]));
    const pathMappings = [];
    for (const [key, paths] of Object.entries(sortedTsConfigPathAliases)) {
        const library = workspaceLibs.find((lib) => lib.importKey === key);
        if (!library) {
            continue;
        }
        // This is for Angular Projects that use ng-package.json
        // It will do nothing for React Projects
        (0, secondary_entry_points_1.collectWorkspaceLibrarySecondaryEntryPoints)(library, sortedTsConfigPathAliases).forEach(({ name, path }) => pathMappings.push({
            name,
            path,
        }));
        pathMappings.push({
            name: key,
            path: (0, path_1.normalize)((0, path_1.join)(devkit_1.workspaceRoot, paths[0])),
        });
    }
    // Collect workspace libs that are not in TS path mappings
    // This supports TS Solution + PM Workspaces where libs use package.json
    const workspaceLibrariesAsDeps = [];
    if (Object.keys(sortedTsConfigPathAliases).length !== workspaceLibs.length) {
        for (const workspaceLib of workspaceLibs) {
            if (!sortedTsConfigPathAliases[workspaceLib.importKey]) {
                workspaceLibrariesAsDeps.push(workspaceLib.importKey);
            }
        }
    }
    const normalModuleReplacementPluginImpl = bundler === 'rspack'
        ? core_1.NormalModuleReplacementPlugin
        : require('webpack').NormalModuleReplacementPlugin;
    return {
        getAliases: () => pathMappings.reduce((aliases, library) => ({
            ...aliases,
            // If the library path ends in a wildcard, remove it as webpack/rspack can't handle this in resolve.alias
            // e.g. path/to/my/lib/* -> path/to/my/lib
            [library.name]: library.path.replace(/\/\*$/, ''),
        }), {}),
        getLibraries: (projectRoot, eager) => {
            let pkgJson = null;
            if (projectRoot &&
                (0, fs_1.existsSync)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot, 'package.json'))) {
                pkgJson = (0, devkit_1.readJsonFile)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot, 'package.json'));
            }
            const libraries = pathMappings.reduce((libraries, library) => {
                // Check to see if the library version is declared in the app's package.json
                let version = pkgJson
                    ? (0, devkit_1.getDependencyVersionFromPackageJson)(library.name, devkit_1.workspaceRoot, pkgJson)
                    : null;
                // Normalize workspace protocol versions (workspace:*, workspace:^, *, file:)
                version = normalizeWorkspaceProtocolVersion(version, library.name, workspaceLibs);
                if (!version && workspaceLibs.length > 0) {
                    const workspaceLib = workspaceLibs.find((lib) => lib.importKey === library.name);
                    const libPackageJsonPath = workspaceLib
                        ? (0, path_1.join)(workspaceLib.root, 'package.json')
                        : null;
                    if (libPackageJsonPath && (0, fs_1.existsSync)(libPackageJsonPath)) {
                        pkgJson = (0, devkit_1.readJsonFile)(libPackageJsonPath);
                        if (pkgJson) {
                            version = pkgJson.version;
                        }
                    }
                }
                return {
                    ...libraries,
                    [library.name]: {
                        ...(version
                            ? {
                                requiredVersion: version,
                                singleton: true,
                            }
                            : { requiredVersion: false }),
                        eager,
                    },
                };
            }, {});
            // Add workspace libs from package.json dependencies
            // This supports TS Solution + PM Workspaces
            for (const libraryName of workspaceLibrariesAsDeps) {
                let version = pkgJson?.dependencies?.[libraryName] ??
                    pkgJson?.devDependencies?.[libraryName];
                // Normalize workspace protocol versions (workspace:*, workspace:^, *, file:)
                version = normalizeWorkspaceProtocolVersion(version, libraryName, workspaceLibs);
                libraries[libraryName] = {
                    ...(version
                        ? { requiredVersion: version, singleton: true }
                        : { requiredVersion: false }),
                    eager,
                };
            }
            return libraries;
        },
        getReplacementPlugin: () => new normalModuleReplacementPluginImpl(/./, (req) => {
            if (!req.request.startsWith('.')) {
                return;
            }
            const from = req.context;
            const to = (0, path_1.normalize)((0, path_1.join)(req.context, req.request));
            for (const library of pathMappings) {
                const libFolder = (0, path_1.normalize)((0, path_1.dirname)(library.path));
                if (!from.startsWith(libFolder) && to.startsWith(libFolder)) {
                    const newReq = library.name.endsWith('/*')
                        ? /**
                           * req usually is in the form of "../../../path/to/file"
                           * library.path is usually in the form of "/Users/username/path/to/Workspace/path/to/library"
                           *
                           * When a wildcard is used in the TS path mappings, we want to get everything after the import to
                           * re-route the request correctly inline with the webpack/rspack resolve.alias
                           */
                            (0, path_1.join)(library.name, req.request.split(library.path.replace(devkit_1.workspaceRoot, '').replace('/*', ''))[1])
                        : library.name;
                    req.request = newReq;
                }
            }
        }),
    };
}
/**
 * Build the Module Federation Share Config for a specific package and the
 * specified version of that package.
 * @param pkgName - Name of the package to share
 * @param version - Version of the package to require by other apps in the Module Federation setup
 */
function getNpmPackageSharedConfig(pkgName, version) {
    if (!version) {
        devkit_1.logger.warn(`Could not find a version for "${pkgName}" in the root "package.json" ` +
            'when collecting shared packages for the Module Federation setup. ' +
            'The package will not be shared.');
        return undefined;
    }
    // Warn if a workspace protocol version is passed - this indicates the package
    // should be configured as a workspace library instead of using sharePackages
    if (isWorkspaceProtocolVersion(version)) {
        devkit_1.logger.warn(`Package "${pkgName}" has a workspace protocol version "${version}" which cannot be used ` +
            'for Module Federation. For workspace libraries, use the workspace library configuration ' +
            'instead of sharePackages. The package will not be shared.');
        return undefined;
    }
    return { singleton: true, strictVersion: true, requiredVersion: version };
}
/**
 * Create a dictionary of packages and their Module Federation Shared Config
 * from an array of package names.
 *
 * Lookup the versions of the packages from the root package.json file in the
 * workspace.
 * @param packages - Array of package names as strings
 */
function sharePackages(packages) {
    const pkgJson = (0, package_json_1.readRootPackageJson)();
    const allPackages = [];
    packages.forEach((pkg) => {
        const pkgVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(pkg, devkit_1.workspaceRoot, pkgJson);
        allPackages.push({ name: pkg, version: pkgVersion });
        (0, secondary_entry_points_1.collectPackageSecondaryEntryPoints)(pkg, pkgVersion, allPackages);
    });
    return allPackages.reduce((shared, pkg) => {
        const config = getNpmPackageSharedConfig(pkg.name, pkg.version);
        if (config) {
            shared[pkg.name] = config;
        }
        return shared;
    }, {});
}
/**
 * Apply a custom function provided by the user that will modify the Shared Config
 * of the dependencies for the Module Federation build.
 *
 * @param sharedConfig - The original Shared Config to be modified
 * @param sharedFn - The custom function to run
 */
function applySharedFunction(sharedConfig, sharedFn) {
    if (!sharedFn) {
        return;
    }
    for (const [libraryName, library] of Object.entries(sharedConfig)) {
        const mappedDependency = sharedFn(libraryName, library);
        if (mappedDependency === false) {
            delete sharedConfig[libraryName];
            continue;
        }
        else if (!mappedDependency) {
            continue;
        }
        sharedConfig[libraryName] = mappedDependency;
    }
}
/**
 * Add additional dependencies to the shared package that may not have been
 * discovered by the project graph.
 *
 * This can be useful for applications that use a Dependency Injection system
 * that expects certain Singleton values to be present in the shared injection
 * hierarchy.
 *
 * @param sharedConfig - The original Shared Config
 * @param additionalShared - The additional dependencies to add
 * @param projectGraph - The Nx project graph
 */
function applyAdditionalShared(sharedConfig, additionalShared, projectGraph) {
    if (!additionalShared) {
        return;
    }
    for (const shared of additionalShared) {
        if (typeof shared === 'string') {
            addStringDependencyToSharedConfig(sharedConfig, shared, projectGraph);
        }
        else if (Array.isArray(shared)) {
            sharedConfig[shared[0]] = shared[1];
        }
        else if (typeof shared === 'object') {
            sharedConfig[shared.libraryName] = shared.sharedConfig;
        }
    }
}
function addStringDependencyToSharedConfig(sharedConfig, dependency, projectGraph) {
    if (projectGraph.nodes[dependency]) {
        sharedConfig[dependency] = { requiredVersion: false };
    }
    else if (projectGraph.externalNodes?.[`npm:${dependency}`]) {
        const pkgJson = (0, package_json_1.readRootPackageJson)();
        const config = getNpmPackageSharedConfig(dependency, (0, devkit_1.getDependencyVersionFromPackageJson)(dependency, devkit_1.workspaceRoot, pkgJson));
        if (!config) {
            return;
        }
        sharedConfig[dependency] = config;
    }
    else {
        const pkgJsonPath = require.resolve(`${dependency}/package.json`);
        if (!pkgJsonPath) {
            throw new Error(`Could not find package ${dependency} when applying it as a shared package. Are you sure it has been installed?`);
        }
        const pkgJson = (0, devkit_1.readJsonFile)(pkgJsonPath);
        const config = getNpmPackageSharedConfig(dependency, pkgJson.version);
    }
}
function getEmptySharedLibrariesConfig(bundler = 'rspack') {
    const normalModuleReplacementPluginImpl = bundler === 'rspack'
        ? core_1.NormalModuleReplacementPlugin
        : require('webpack').NormalModuleReplacementPlugin;
    return {
        getAliases: () => ({}),
        getLibraries: () => ({}),
        getReplacementPlugin: () => new normalModuleReplacementPluginImpl(/./, () => { }),
    };
}
