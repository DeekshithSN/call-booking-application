"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withModuleFederationForSSR = withModuleFederationForSSR;
const core_1 = require("@rspack/core");
const utils_1 = require("../../utils");
const utils_2 = require("./utils");
const devkit_1 = require("@nx/devkit");
async function withModuleFederationForSSR(options, configOverride) {
    if (global.NX_GRAPH_CREATION) {
        return (config) => config;
    }
    const isDevServer = process.env['WEBPACK_SERVE'];
    const { sharedLibraries, sharedDependencies, mappedRemotes } = (0, utils_2.getModuleFederationConfig)(options, {
        isServer: true,
    });
    return (config, { context }) => {
        config.target = 'async-node';
        config.output.uniqueName = options.name;
        config.output.library = {
            type: 'commonjs-module',
        };
        config.resolve ??= {};
        config.resolve.modules = [
            ...(config.resolve.modules ?? ['node_modules']),
            devkit_1.workspaceRoot,
        ];
        config.optimization = {
            ...(config.optimization ?? {}),
            runtimeChunk: isDevServer
                ? (config.optimization?.runtimeChunk ?? undefined)
                : false,
        };
        config.plugins.push(new (require('@module-federation/enhanced/rspack').ModuleFederationPlugin)({
            name: (0, utils_1.normalizeProjectName)(options.name),
            filename: 'remoteEntry.js',
            exposes: options.exposes,
            remotes: mappedRemotes,
            shared: {
                ...sharedDependencies,
            },
            isServer: true,
            library: {
                type: 'commonjs-module',
            },
            remoteType: 'script',
            /**
             * Apply user-defined config overrides
             */
            ...(configOverride ? configOverride : {}),
            experiments: {
                asyncStartup: true,
                // We should allow users to override experiments
                ...(configOverride?.experiments ?? {}),
            },
            runtimePlugins: process.env.NX_MF_DEV_REMOTES &&
                !options.disableNxRuntimeLibraryControlPlugin
                ? [
                    ...(configOverride?.runtimePlugins ?? []),
                    require.resolve('@module-federation/node/runtimePlugin'),
                    require.resolve('@nx/module-federation/src/utils/plugins/runtime-library-control.plugin.js'),
                ]
                : [
                    ...(configOverride?.runtimePlugins ?? []),
                    require.resolve('@module-federation/node/runtimePlugin'),
                ],
        }, {}), sharedLibraries.getReplacementPlugin());
        // The env var is only set from the module-federation-dev-server
        // Attach the runtime plugin
        config.plugins.push(new core_1.DefinePlugin({
            'process.env.NX_MF_DEV_REMOTES': process.env.NX_MF_DEV_REMOTES,
        }));
        return config;
    };
}
