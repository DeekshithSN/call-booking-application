"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installCommonDependencies = installCommonDependencies;
const devkit_1 = require("@nx/devkit");
const add_swc_dependencies_1 = require("@nx/js/src/utils/swc/add-swc-dependencies");
const version_utils_1 = require("../../../utils/version-utils");
const versions_1 = require("../../../utils/versions");
async function installCommonDependencies(host, options) {
    const tasks = [];
    const reactVersions = await (0, version_utils_1.getReactDependenciesVersionsToInstall)(host);
    const dependencies = {};
    const devDependencies = {
        '@types/node': versions_1.typesNodeVersion,
        '@types/react': reactVersions['@types/react'],
        '@types/react-dom': reactVersions['@types/react-dom'],
    };
    if (options.bundler !== 'vite') {
        dependencies['tslib'] = versions_1.tsLibVersion;
    }
    // Vite requires style preprocessors to be installed manually.
    // `@nx/webpack` installs them automatically for now.
    // TODO(jack): Once we clean up webpack we can remove this check
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
    if (options.unitTestRunner && options.unitTestRunner !== 'none') {
        devDependencies['@testing-library/react'] = versions_1.testingLibraryReactVersion;
        devDependencies['@testing-library/dom'] = versions_1.testingLibraryDomVersion;
    }
    const baseInstallTask = (0, devkit_1.addDependenciesToPackageJson)(host, dependencies, devDependencies);
    tasks.push(baseInstallTask);
    if (options.compiler === 'swc') {
        tasks.push((0, add_swc_dependencies_1.addSwcDependencies)(host));
    }
    else if (options.compiler === 'babel') {
        tasks.push((0, devkit_1.addDependenciesToPackageJson)(host, {}, {
            '@babel/preset-react': versions_1.babelPresetReactVersion,
            '@babel/core': versions_1.babelCoreVersion,
        }));
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
