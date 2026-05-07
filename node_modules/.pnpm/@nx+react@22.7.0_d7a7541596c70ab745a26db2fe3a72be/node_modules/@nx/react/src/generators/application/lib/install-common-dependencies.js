"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installCommonDependencies = installCommonDependencies;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../../utils/versions");
const version_utils_1 = require("../../../utils/version-utils");
async function installCommonDependencies(host, options) {
    if (options.skipPackageJson) {
        return () => { };
    }
    const reactDeps = await (0, version_utils_1.getReactDependenciesVersionsToInstall)(host);
    const dependencies = {};
    const devDependencies = {
        '@types/react': reactDeps['@types/react'],
        '@types/react-dom': reactDeps['@types/react-dom'],
        '@types/node': versions_1.typesNodeVersion,
        ...(options.useReactRouter
            ? {
                '@react-router/dev': versions_1.reactRouterVersion,
            }
            : {}),
    };
    if (options.bundler !== 'vite') {
        dependencies['tslib'] = versions_1.tsLibVersion;
    }
    if (options.useReactRouter) {
        dependencies['react-router'] = versions_1.reactRouterVersion;
        dependencies['@react-router/node'] = versions_1.reactRouterVersion;
        dependencies['@react-router/serve'] = versions_1.reactRouterVersion;
        dependencies['isbot'] = versions_1.reactRouterIsBotVersion;
    }
    // Vite requires style preprocessors to be installed manually.
    // `@nx/webpack` installs them automatically for now.
    if (options.bundler === 'vite' || options.unitTestRunner === 'vitest') {
        switch (options.style) {
            case 'scss':
                devDependencies['sass'] = versions_1.sassVersion;
                break;
            case 'less':
                devDependencies['less'] = versions_1.lessVersion;
                break;
        }
    }
    if (options.bundler === 'webpack') {
        if (options.compiler === 'swc') {
            devDependencies['swc-loader'] = versions_1.swcLoaderVersion;
        }
        else if (options.compiler === 'babel') {
            // babel-loader is currently included in @nx/webpack
            // TODO(jack): Install babel-loader and other babel packages only as needed
            devDependencies['@babel/preset-react'] = versions_1.babelPresetReactVersion;
            devDependencies['@babel/core'] = versions_1.babelCoreVersion;
        }
    }
    if (options.unitTestRunner && options.unitTestRunner !== 'none') {
        devDependencies['@testing-library/react'] = versions_1.testingLibraryReactVersion;
        devDependencies['@testing-library/dom'] = versions_1.testingLibraryDomVersion;
    }
    return (0, devkit_1.addDependenciesToPackageJson)(host, dependencies, devDependencies);
}
