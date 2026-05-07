"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NxModuleFederationSSRDevServerPlugin = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@rspack/core");
const pc = tslib_1.__importStar(require("picocolors"));
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
const fs_1 = require("fs");
const utils_1 = require("../../utils");
const node_child_process_1 = require("node:child_process");
const PLUGIN_NAME = 'NxModuleFederationSSRDevServerPlugin';
class NxModuleFederationSSRDevServerPlugin {
    constructor(_options) {
        this._options = _options;
        this.nxBin = require.resolve('nx/bin/nx');
        this._options.devServerConfig ??= {
            host: 'localhost',
        };
    }
    apply(compiler) {
        const isDevServer = process.env['WEBPACK_SERVE'];
        if (!isDevServer) {
            return;
        }
        compiler.hooks.watchRun.tapAsync(PLUGIN_NAME, async (compiler, callback) => {
            compiler.hooks.beforeCompile.tapAsync(PLUGIN_NAME, async (params, callback) => {
                const staticRemotesConfig = await this.setup(compiler);
                devkit_1.logger.info(`NX Starting module federation dev-server for ${pc.bold(this._options.config.name)} with ${Object.keys(staticRemotesConfig).length} remotes`);
                const mappedLocationOfRemotes = await (0, utils_1.buildStaticRemotes)(staticRemotesConfig, this._options.devServerConfig, this.nxBin);
                (0, utils_1.startStaticRemotesFileServer)(staticRemotesConfig, devkit_1.workspaceRoot, this._options.devServerConfig.staticRemotesPort);
                await (0, utils_1.startRemoteProxies)(staticRemotesConfig, mappedLocationOfRemotes, {
                    pathToCert: this._options.devServerConfig.sslCert,
                    pathToKey: this._options.devServerConfig.sslKey,
                }, true, this._options.devServerConfig.host);
                new core_1.DefinePlugin({
                    'process.env.NX_MF_DEV_REMOTES': process.env.NX_MF_DEV_REMOTES,
                }).apply(compiler);
                await this.startServer(compiler);
                callback();
            });
            callback();
        });
    }
    async startServer(compiler) {
        compiler.hooks.done.tapAsync(PLUGIN_NAME, async (_, callback) => {
            const serverPath = (0, path_1.join)(compiler.options.output.path, compiler.options.output.filename ?? 'server.js');
            if (this.devServerProcess) {
                await new Promise((res) => {
                    this.devServerProcess.on('exit', () => {
                        res();
                    });
                    this.devServerProcess.kill('SIGKILL');
                    this.devServerProcess = undefined;
                });
            }
            if (!(0, fs_1.existsSync)(serverPath)) {
                for (let retries = 0; retries < 10; retries++) {
                    await new Promise((res) => setTimeout(res, 200));
                    if ((0, fs_1.existsSync)(serverPath)) {
                        break;
                    }
                }
                if (!(0, fs_1.existsSync)(serverPath)) {
                    throw new Error(`Could not find server bundle at ${serverPath}.`);
                }
            }
            this.devServerProcess = (0, node_child_process_1.fork)(serverPath);
            process.on('exit', () => {
                this.devServerProcess?.kill('SIGKILL');
            });
            process.on('SIGINT', () => {
                this.devServerProcess?.kill('SIGKILL');
            });
            callback();
        });
    }
    async setup(compiler) {
        const projectGraph = (0, devkit_1.readCachedProjectGraph)();
        const { projects: workspaceProjects } = (0, devkit_1.readProjectsConfigurationFromProjectGraph)(projectGraph);
        const project = workspaceProjects[this._options.config.name];
        if (!this._options.devServerConfig.pathToManifestFile) {
            this._options.devServerConfig.pathToManifestFile =
                (0, utils_1.getDynamicMfManifestFile)(project, devkit_1.workspaceRoot);
        }
        else {
            const userPathToManifestFile = (0, path_1.join)(devkit_1.workspaceRoot, this._options.devServerConfig.pathToManifestFile);
            if (!(0, fs_1.existsSync)(userPathToManifestFile)) {
                throw new Error(`The provided Module Federation manifest file path does not exist. Please check the file exists at "${userPathToManifestFile}".`);
            }
            else if ((0, path_1.extname)(this._options.devServerConfig.pathToManifestFile) !== '.json') {
                throw new Error(`The Module Federation manifest file must be a JSON. Please ensure the file at ${userPathToManifestFile} is a JSON.`);
            }
            this._options.devServerConfig.pathToManifestFile = userPathToManifestFile;
        }
        const { remotes, staticRemotePort } = (0, utils_1.getRemotes)(this._options.config, projectGraph, this._options.devServerConfig.pathToManifestFile);
        this._options.devServerConfig.staticRemotesPort ??= staticRemotePort;
        const remotesConfig = (0, utils_1.parseRemotesConfig)(remotes, devkit_1.workspaceRoot, projectGraph, true);
        const staticRemotesConfig = await (0, utils_1.getStaticRemotes)(remotesConfig.config ?? {});
        const devRemotes = remotes.filter((r) => !staticRemotesConfig[r]);
        process.env.NX_MF_DEV_REMOTES = JSON.stringify([
            ...(devRemotes.length > 0 ? devRemotes : []),
            project.name,
        ]);
        return staticRemotesConfig ?? {};
    }
}
exports.NxModuleFederationSSRDevServerPlugin = NxModuleFederationSSRDevServerPlugin;
