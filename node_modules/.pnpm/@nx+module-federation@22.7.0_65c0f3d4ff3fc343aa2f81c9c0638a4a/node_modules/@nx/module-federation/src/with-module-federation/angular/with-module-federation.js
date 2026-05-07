"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withModuleFederation = withModuleFederation;
const utils_1 = require("../../utils");
const utils_2 = require("./utils");
const webpack_1 = require("@module-federation/enhanced/webpack");
const devkit_1 = require("@nx/devkit");
async function withModuleFederation(options, configOverride) {
    if (global.NX_GRAPH_CREATION) {
        return (config) => config;
    }
    // This is required to ensure that the webpack version used by the Angular CLI is used
    process.env['FEDERATION_WEBPACK_PATH'] = require.resolve('webpack', {
        paths: [require.resolve('@angular-devkit/build-angular')],
    });
    const isDevServer = process.env['WEBPACK_SERVE'];
    const { sharedLibraries, sharedDependencies, mappedRemotes } = await (0, utils_2.getModuleFederationConfig)(options, undefined, 'webpack');
    return (config) => {
        const updatedConfig = {
            ...(config ?? {}),
            output: {
                ...(config.output ?? {}),
                uniqueName: options.name,
                publicPath: 'auto',
            },
            optimization: {
                ...(config.optimization ?? {}),
                runtimeChunk: isDevServer && !options.exposes
                    ? (config.optimization?.runtimeChunk ?? undefined)
                    : false,
            },
            resolve: {
                ...(config.resolve ?? {}),
                // Ensure workspace root is in resolve.modules so that expose paths
                // like "apps/remote/src/..." resolve correctly without baseUrl.
                modules: [
                    ...(config.resolve?.modules ?? ['node_modules']),
                    devkit_1.workspaceRoot,
                ],
                alias: {
                    ...(config.resolve?.alias ?? {}),
                    ...sharedLibraries.getAliases(),
                },
            },
            experiments: {
                ...(config.experiments ?? {}),
                outputModule: true,
            },
            plugins: [
                ...(config.plugins ?? []),
                new webpack_1.ModuleFederationPlugin({
                    name: (0, utils_1.normalizeProjectName)(options.name),
                    filename: 'remoteEntry.mjs',
                    exposes: options.exposes,
                    remotes: mappedRemotes,
                    shared: {
                        ...sharedDependencies,
                    },
                    library: {
                        type: 'module',
                    },
                    /**
                     * Apply user-defined config override
                     */
                    ...(configOverride ? configOverride : {}),
                    runtimePlugins: process.env.NX_MF_DEV_REMOTES &&
                        !options.disableNxRuntimeLibraryControlPlugin
                        ? [
                            ...(configOverride?.runtimePlugins ?? []),
                            require.resolve('@nx/module-federation/src/utils/plugins/runtime-library-control.plugin.js'),
                        ]
                        : configOverride?.runtimePlugins,
                }),
                sharedLibraries.getReplacementPlugin(),
            ],
        };
        // The env var is only set from the module-federation-dev-server
        // Attach the runtime plugin
        updatedConfig.plugins.push(new (require('webpack').DefinePlugin)({
            'process.env.NX_MF_DEV_REMOTES': process.env.NX_MF_DEV_REMOTES,
        }));
        return updatedConfig;
    };
}
