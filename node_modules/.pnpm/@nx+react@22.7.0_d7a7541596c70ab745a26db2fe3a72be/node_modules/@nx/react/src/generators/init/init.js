"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactInitGenerator = reactInitGenerator;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../utils/versions");
const version_utils_1 = require("../../utils/version-utils");
const add_plugin_1 = require("@nx/devkit/src/utils/add-plugin");
const router_plugin_1 = require("../../plugins/router-plugin");
async function reactInitGenerator(tree, schema) {
    const tasks = [];
    if (!schema.skipPackageJson) {
        tasks.push((0, devkit_1.removeDependenciesFromPackageJson)(tree, ['@nx/react'], []));
        const reactDeps = await (0, version_utils_1.getReactDependenciesVersionsToInstall)(tree);
        tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {
            react: reactDeps.react,
            'react-dom': reactDeps['react-dom'],
        }, {
            '@nx/react': versions_1.nxVersion,
        }, undefined, schema.keepExistingVersions));
    }
    const nxJson = (0, devkit_1.readNxJson)(tree);
    schema.addPlugin ??=
        process.env.NX_ADD_PLUGINS !== 'false' &&
            nxJson.useInferencePlugins !== false;
    if (schema.useReactRouterPlugin && schema.addPlugin) {
        await (0, add_plugin_1.addPlugin)(tree, await (0, devkit_1.createProjectGraphAsync)(), '@nx/react/router-plugin', router_plugin_1.createNodesV2, {
            buildTargetName: ['build', 'react-router:build', 'react-router-build'],
            devTargetName: ['dev', 'react-router:dev', 'react-router-dev'],
            startTargetName: ['start', 'react-router-serve', 'react-router-start'],
            watchDepsTargetName: [
                'watch-deps',
                'react-router:watch-deps',
                'react-router-watch-deps',
            ],
            buildDepsTargetName: [
                'build-deps',
                'react-router:build-deps',
                'react-router-build-deps',
            ],
        }, schema.updatePackageScripts);
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = reactInitGenerator;
