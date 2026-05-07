"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NxModuleFederationPlugin = void 0;
const utils_1 = require("../../../with-module-federation/rspack/utils");
const utils_2 = require("../../../utils");
const devkit_1 = require("@nx/devkit");
class NxModuleFederationPlugin {
    constructor(_options, configOverride) {
        this._options = _options;
        this.configOverride = configOverride;
    }
    apply(compiler) {
        if (global.NX_GRAPH_CREATION) {
            return;
        }
        // This is required to ensure Module Federation will build the project correctly
        compiler.options.optimization ??= {};
        compiler.options.optimization.runtimeChunk = false;
        if (compiler.options.optimization.splitChunks) {
            compiler.options.optimization.splitChunks.cacheGroups ??= {};
            compiler.options.optimization.splitChunks.cacheGroups.default = false;
            compiler.options.optimization.splitChunks.cacheGroups.common = false;
        }
        compiler.options.output.uniqueName = this._options.config.name;
        // Ensure workspace root is in resolve.modules so that expose paths
        // like "apps/remote/src/..." resolve correctly without baseUrl.
        compiler.options.resolve ??= {};
        compiler.options.resolve.modules = [
            ...(compiler.options.resolve.modules ?? ['node_modules']),
            devkit_1.workspaceRoot,
        ];
        if (compiler.options.output.scriptType === 'module') {
            compiler.options.output.scriptType = undefined;
            compiler.options.output.module = undefined;
        }
        if (this._options.isServer) {
            compiler.options.target = 'async-node';
            compiler.options.output.library ??= {
                type: 'commonjs-module',
            };
            compiler.options.output.library.type = 'commonjs-module';
        }
        const config = (0, utils_1.getModuleFederationConfig)(this._options.config, {
            isServer: this._options.isServer,
        });
        const sharedLibraries = config.sharedLibraries;
        const sharedDependencies = config.sharedDependencies;
        const mappedRemotes = config.mappedRemotes;
        const runtimePlugins = [];
        if (this.configOverride?.runtimePlugins) {
            runtimePlugins.push(...(this.configOverride.runtimePlugins ?? []));
        }
        if (this._options.isServer) {
            runtimePlugins.push(require.resolve('@module-federation/node/runtimePlugin'));
        }
        new (require('@module-federation/enhanced/rspack').ModuleFederationPlugin)({
            name: (0, utils_2.normalizeProjectName)(this._options.config.name),
            filename: 'remoteEntry.js',
            exposes: this._options.config.exposes,
            remotes: mappedRemotes,
            shared: {
                ...(sharedDependencies ?? {}),
            },
            ...(this._options.isServer
                ? {
                    library: {
                        type: 'commonjs-module',
                    },
                    remoteType: 'script',
                }
                : {}),
            ...(this.configOverride ? this.configOverride : {}),
            runtimePlugins,
        }).apply(compiler);
        if (sharedLibraries) {
            sharedLibraries.getReplacementPlugin().apply(compiler);
        }
    }
}
exports.NxModuleFederationPlugin = NxModuleFederationPlugin;
