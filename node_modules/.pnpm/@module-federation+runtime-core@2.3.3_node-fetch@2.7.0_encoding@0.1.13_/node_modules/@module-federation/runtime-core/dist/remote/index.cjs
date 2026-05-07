const require_logger = require('../utils/logger.cjs');
const require_global = require('../global.cjs');
const require_constant = require('../constant.cjs');
const require_share = require('../utils/share.cjs');
const require_manifest = require('../utils/manifest.cjs');
const require_load = require('../utils/load.cjs');
const require_context = require('../utils/context.cjs');
require('../utils/index.cjs');
const require_preload = require('../utils/preload.cjs');
const require_index$1 = require('../module/index.cjs');
const require_syncHook = require('../utils/hooks/syncHook.cjs');
const require_asyncHook = require('../utils/hooks/asyncHook.cjs');
const require_syncWaterfallHook = require('../utils/hooks/syncWaterfallHook.cjs');
const require_asyncWaterfallHooks = require('../utils/hooks/asyncWaterfallHooks.cjs');
const require_pluginSystem = require('../utils/hooks/pluginSystem.cjs');
require('../utils/hooks/index.cjs');
const require_SnapshotHandler = require('../plugins/snapshot/SnapshotHandler.cjs');
let _module_federation_sdk = require("@module-federation/sdk");
let _module_federation_error_codes = require("@module-federation/error-codes");

//#region src/remote/index.ts
var RemoteHandler = class {
	constructor(host) {
		this.hooks = new require_pluginSystem.PluginSystem({
			beforeRegisterRemote: new require_syncWaterfallHook.SyncWaterfallHook("beforeRegisterRemote"),
			registerRemote: new require_syncWaterfallHook.SyncWaterfallHook("registerRemote"),
			beforeRequest: new require_asyncWaterfallHooks.AsyncWaterfallHook("beforeRequest"),
			onLoad: new require_asyncHook.AsyncHook("onLoad"),
			handlePreloadModule: new require_syncHook.SyncHook("handlePreloadModule"),
			errorLoadRemote: new require_asyncHook.AsyncHook("errorLoadRemote"),
			beforePreloadRemote: new require_asyncHook.AsyncHook("beforePreloadRemote"),
			generatePreloadAssets: new require_asyncHook.AsyncHook("generatePreloadAssets"),
			afterPreloadRemote: new require_asyncHook.AsyncHook(),
			loadEntry: new require_asyncHook.AsyncHook()
		});
		this.host = host;
		this.idToRemoteMap = {};
	}
	formatAndRegisterRemote(globalOptions, userOptions) {
		return (userOptions.remotes || []).reduce((res, remote) => {
			this.registerRemote(remote, res, { force: false });
			return res;
		}, globalOptions.remotes);
	}
	setIdToRemoteMap(id, remoteMatchInfo) {
		const { remote, expose } = remoteMatchInfo;
		const { name, alias } = remote;
		this.idToRemoteMap[id] = {
			name: remote.name,
			expose
		};
		if (alias && id.startsWith(name)) {
			const idWithAlias = id.replace(name, alias);
			this.idToRemoteMap[idWithAlias] = {
				name: remote.name,
				expose
			};
			return;
		}
		if (alias && id.startsWith(alias)) {
			const idWithName = id.replace(alias, name);
			this.idToRemoteMap[idWithName] = {
				name: remote.name,
				expose
			};
		}
	}
	async loadRemote(id, options) {
		const { host } = this;
		try {
			const { loadFactory = true } = options || { loadFactory: true };
			const { module, moduleOptions, remoteMatchInfo } = await this.getRemoteModuleAndOptions({ id });
			const { pkgNameOrAlias, remote, expose, id: idRes, remoteSnapshot } = remoteMatchInfo;
			const moduleOrFactory = await module.get(idRes, expose, options, remoteSnapshot);
			const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
				id: idRes,
				pkgNameOrAlias,
				expose,
				exposeModule: loadFactory ? moduleOrFactory : void 0,
				exposeModuleFactory: loadFactory ? void 0 : moduleOrFactory,
				remote,
				options: moduleOptions,
				moduleInstance: module,
				origin: host
			});
			this.setIdToRemoteMap(id, remoteMatchInfo);
			if (typeof moduleWrapper === "function") return moduleWrapper;
			return moduleOrFactory;
		} catch (error) {
			const { from = "runtime" } = options || { from: "runtime" };
			const failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
				id,
				error,
				from,
				lifecycle: "onLoad",
				origin: host
			});
			if (!failOver) throw error;
			return failOver;
		}
	}
	async preloadRemote(preloadOptions) {
		const { host } = this;
		await this.hooks.lifecycle.beforePreloadRemote.emit({
			preloadOps: preloadOptions,
			options: host.options,
			origin: host
		});
		const preloadOps = require_preload.formatPreloadArgs(host.options.remotes, preloadOptions);
		await Promise.all(preloadOps.map(async (ops) => {
			const { remote } = ops;
			const remoteInfo = require_load.getRemoteInfo(remote);
			const { globalSnapshot, remoteSnapshot } = await host.snapshotHandler.loadRemoteSnapshotInfo({ moduleInfo: remote });
			const assets = await this.hooks.lifecycle.generatePreloadAssets.emit({
				origin: host,
				preloadOptions: ops,
				remote,
				remoteInfo,
				globalSnapshot,
				remoteSnapshot
			});
			if (!assets) return;
			require_preload.preloadAssets(remoteInfo, host, assets);
		}));
	}
	registerRemotes(remotes, options) {
		const { host } = this;
		remotes.forEach((remote) => {
			this.registerRemote(remote, host.options.remotes, { force: options?.force });
		});
	}
	async getRemoteModuleAndOptions(options) {
		const { host } = this;
		const { id } = options;
		let loadRemoteArgs;
		try {
			loadRemoteArgs = await this.hooks.lifecycle.beforeRequest.emit({
				id,
				options: host.options,
				origin: host
			});
		} catch (error) {
			loadRemoteArgs = await this.hooks.lifecycle.errorLoadRemote.emit({
				id,
				options: host.options,
				origin: host,
				from: "runtime",
				error,
				lifecycle: "beforeRequest"
			});
			if (!loadRemoteArgs) throw error;
		}
		const { id: idRes } = loadRemoteArgs;
		const remoteSplitInfo = require_manifest.matchRemoteWithNameAndExpose(host.options.remotes, idRes);
		if (!remoteSplitInfo) require_logger.error(_module_federation_error_codes.RUNTIME_004, _module_federation_error_codes.runtimeDescMap, {
			hostName: host.options.name,
			requestId: idRes
		}, void 0, require_context.optionsToMFContext(host.options));
		const { remote: rawRemote } = remoteSplitInfo;
		const remoteInfo = require_load.getRemoteInfo(rawRemote);
		const matchInfo = await host.sharedHandler.hooks.lifecycle.afterResolve.emit({
			id: idRes,
			...remoteSplitInfo,
			options: host.options,
			origin: host,
			remoteInfo
		});
		const { remote, expose } = matchInfo;
		require_logger.assert(remote && expose, `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`);
		let module = host.moduleCache.get(remote.name);
		const moduleOptions = {
			host,
			remoteInfo
		};
		if (!module) {
			module = new require_index$1.Module(moduleOptions);
			host.moduleCache.set(remote.name, module);
		}
		return {
			module,
			moduleOptions,
			remoteMatchInfo: matchInfo
		};
	}
	registerRemote(remote, targetRemotes, options) {
		const { host } = this;
		const normalizeRemote = () => {
			if (remote.alias) {
				const findEqual = targetRemotes.find((item) => remote.alias && (item.name.startsWith(remote.alias) || item.alias?.startsWith(remote.alias)));
				require_logger.assert(!findEqual, `The alias ${remote.alias} of remote ${remote.name} is not allowed to be the prefix of ${findEqual && findEqual.name} name or alias`);
			}
			if ("entry" in remote) {
				if (_module_federation_sdk.isBrowserEnvValue && typeof window !== "undefined" && !remote.entry.startsWith("http")) remote.entry = new URL(remote.entry, window.location.origin).href;
			}
			if (!remote.shareScope) remote.shareScope = require_constant.DEFAULT_SCOPE;
			if (!remote.type) remote.type = require_constant.DEFAULT_REMOTE_TYPE;
		};
		this.hooks.lifecycle.beforeRegisterRemote.emit({
			remote,
			origin: host
		});
		const registeredRemote = targetRemotes.find((item) => item.name === remote.name);
		if (!registeredRemote) {
			normalizeRemote();
			targetRemotes.push(remote);
			this.hooks.lifecycle.registerRemote.emit({
				remote,
				origin: host
			});
		} else {
			const messages = [`The remote "${remote.name}" is already registered.`, "Please note that overriding it may cause unexpected errors."];
			if (options?.force) {
				this.removeRemote(registeredRemote);
				normalizeRemote();
				targetRemotes.push(remote);
				this.hooks.lifecycle.registerRemote.emit({
					remote,
					origin: host
				});
				(0, _module_federation_sdk.warn)(messages.join(" "));
			}
		}
	}
	removeRemote(remote) {
		try {
			const { host } = this;
			const { name } = remote;
			const remoteIndex = host.options.remotes.findIndex((item) => item.name === name);
			if (remoteIndex !== -1) host.options.remotes.splice(remoteIndex, 1);
			const loadedModule = host.moduleCache.get(remote.name);
			if (loadedModule) {
				const remoteInfo = loadedModule.remoteInfo;
				const key = remoteInfo.entryGlobalName;
				if (require_global.CurrentGlobal[key]) if (Object.getOwnPropertyDescriptor(require_global.CurrentGlobal, key)?.configurable) delete require_global.CurrentGlobal[key];
				else require_global.CurrentGlobal[key] = void 0;
				const remoteEntryUniqueKey = require_load.getRemoteEntryUniqueKey(loadedModule.remoteInfo);
				if (require_global.globalLoading[remoteEntryUniqueKey]) delete require_global.globalLoading[remoteEntryUniqueKey];
				host.snapshotHandler.manifestCache.delete(remoteInfo.entry);
				let remoteInsId = remoteInfo.buildVersion ? (0, _module_federation_sdk.composeKeyWithSeparator)(remoteInfo.name, remoteInfo.buildVersion) : remoteInfo.name;
				const remoteInsIndex = require_global.CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((ins) => {
					if (remoteInfo.buildVersion) return ins.options.id === remoteInsId;
					else return ins.name === remoteInsId;
				});
				if (remoteInsIndex !== -1) {
					const remoteIns = require_global.CurrentGlobal.__FEDERATION__.__INSTANCES__[remoteInsIndex];
					remoteInsId = remoteIns.options.id || remoteInsId;
					const globalShareScopeMap = require_share.getGlobalShareScope();
					let isAllSharedNotUsed = true;
					const needDeleteKeys = [];
					Object.keys(globalShareScopeMap).forEach((instId) => {
						const shareScopeMap = globalShareScopeMap[instId];
						shareScopeMap && Object.keys(shareScopeMap).forEach((shareScope) => {
							const shareScopeVal = shareScopeMap[shareScope];
							shareScopeVal && Object.keys(shareScopeVal).forEach((shareName) => {
								const sharedPkgs = shareScopeVal[shareName];
								sharedPkgs && Object.keys(sharedPkgs).forEach((shareVersion) => {
									const shared = sharedPkgs[shareVersion];
									if (shared && typeof shared === "object" && shared.from === remoteInfo.name) if (shared.loaded || shared.loading) {
										shared.useIn = shared.useIn.filter((usedHostName) => usedHostName !== remoteInfo.name);
										if (shared.useIn.length) isAllSharedNotUsed = false;
										else needDeleteKeys.push([
											instId,
											shareScope,
											shareName,
											shareVersion
										]);
									} else needDeleteKeys.push([
										instId,
										shareScope,
										shareName,
										shareVersion
									]);
								});
							});
						});
					});
					if (isAllSharedNotUsed) {
						remoteIns.shareScopeMap = {};
						delete globalShareScopeMap[remoteInsId];
					}
					needDeleteKeys.forEach(([insId, shareScope, shareName, shareVersion]) => {
						delete globalShareScopeMap[insId]?.[shareScope]?.[shareName]?.[shareVersion];
					});
					require_global.CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(remoteInsIndex, 1);
				}
				const { hostGlobalSnapshot } = require_SnapshotHandler.getGlobalRemoteInfo(remote, host);
				if (hostGlobalSnapshot) {
					const remoteKey = hostGlobalSnapshot && "remotesInfo" in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && require_global.getInfoWithoutType(hostGlobalSnapshot.remotesInfo, remote.name).key;
					if (remoteKey) {
						delete hostGlobalSnapshot.remotesInfo[remoteKey];
						if (Boolean(require_global.Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey])) delete require_global.Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey];
					}
				}
				host.moduleCache.delete(remote.name);
			}
		} catch (err) {
			require_logger.logger.error(`removeRemote failed: ${err instanceof Error ? err.message : String(err)}`);
		}
	}
};

//#endregion
exports.RemoteHandler = RemoteHandler;
//# sourceMappingURL=index.cjs.map