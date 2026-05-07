import { assert, error, logger } from "../utils/logger.js";
import { CurrentGlobal, Global, getInfoWithoutType, globalLoading } from "../global.js";
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from "../constant.js";
import { getGlobalShareScope } from "../utils/share.js";
import { matchRemoteWithNameAndExpose } from "../utils/manifest.js";
import { getRemoteEntryUniqueKey, getRemoteInfo } from "../utils/load.js";
import { optionsToMFContext } from "../utils/context.js";
import "../utils/index.js";
import { formatPreloadArgs, preloadAssets } from "../utils/preload.js";
import { Module as Module$1 } from "../module/index.js";
import { SyncHook } from "../utils/hooks/syncHook.js";
import { AsyncHook } from "../utils/hooks/asyncHook.js";
import { SyncWaterfallHook } from "../utils/hooks/syncWaterfallHook.js";
import { AsyncWaterfallHook } from "../utils/hooks/asyncWaterfallHooks.js";
import { PluginSystem } from "../utils/hooks/pluginSystem.js";
import "../utils/hooks/index.js";
import { getGlobalRemoteInfo } from "../plugins/snapshot/SnapshotHandler.js";
import { composeKeyWithSeparator, isBrowserEnvValue, warn } from "@module-federation/sdk";
import { RUNTIME_004, runtimeDescMap } from "@module-federation/error-codes";

//#region src/remote/index.ts
var RemoteHandler = class {
	constructor(host) {
		this.hooks = new PluginSystem({
			beforeRegisterRemote: new SyncWaterfallHook("beforeRegisterRemote"),
			registerRemote: new SyncWaterfallHook("registerRemote"),
			beforeRequest: new AsyncWaterfallHook("beforeRequest"),
			onLoad: new AsyncHook("onLoad"),
			handlePreloadModule: new SyncHook("handlePreloadModule"),
			errorLoadRemote: new AsyncHook("errorLoadRemote"),
			beforePreloadRemote: new AsyncHook("beforePreloadRemote"),
			generatePreloadAssets: new AsyncHook("generatePreloadAssets"),
			afterPreloadRemote: new AsyncHook(),
			loadEntry: new AsyncHook()
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
		const preloadOps = formatPreloadArgs(host.options.remotes, preloadOptions);
		await Promise.all(preloadOps.map(async (ops) => {
			const { remote } = ops;
			const remoteInfo = getRemoteInfo(remote);
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
			preloadAssets(remoteInfo, host, assets);
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
		const remoteSplitInfo = matchRemoteWithNameAndExpose(host.options.remotes, idRes);
		if (!remoteSplitInfo) error(RUNTIME_004, runtimeDescMap, {
			hostName: host.options.name,
			requestId: idRes
		}, void 0, optionsToMFContext(host.options));
		const { remote: rawRemote } = remoteSplitInfo;
		const remoteInfo = getRemoteInfo(rawRemote);
		const matchInfo = await host.sharedHandler.hooks.lifecycle.afterResolve.emit({
			id: idRes,
			...remoteSplitInfo,
			options: host.options,
			origin: host,
			remoteInfo
		});
		const { remote, expose } = matchInfo;
		assert(remote && expose, `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`);
		let module = host.moduleCache.get(remote.name);
		const moduleOptions = {
			host,
			remoteInfo
		};
		if (!module) {
			module = new Module$1(moduleOptions);
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
				assert(!findEqual, `The alias ${remote.alias} of remote ${remote.name} is not allowed to be the prefix of ${findEqual && findEqual.name} name or alias`);
			}
			if ("entry" in remote) {
				if (isBrowserEnvValue && typeof window !== "undefined" && !remote.entry.startsWith("http")) remote.entry = new URL(remote.entry, window.location.origin).href;
			}
			if (!remote.shareScope) remote.shareScope = DEFAULT_SCOPE;
			if (!remote.type) remote.type = DEFAULT_REMOTE_TYPE;
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
				warn(messages.join(" "));
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
				if (CurrentGlobal[key]) if (Object.getOwnPropertyDescriptor(CurrentGlobal, key)?.configurable) delete CurrentGlobal[key];
				else CurrentGlobal[key] = void 0;
				const remoteEntryUniqueKey = getRemoteEntryUniqueKey(loadedModule.remoteInfo);
				if (globalLoading[remoteEntryUniqueKey]) delete globalLoading[remoteEntryUniqueKey];
				host.snapshotHandler.manifestCache.delete(remoteInfo.entry);
				let remoteInsId = remoteInfo.buildVersion ? composeKeyWithSeparator(remoteInfo.name, remoteInfo.buildVersion) : remoteInfo.name;
				const remoteInsIndex = CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((ins) => {
					if (remoteInfo.buildVersion) return ins.options.id === remoteInsId;
					else return ins.name === remoteInsId;
				});
				if (remoteInsIndex !== -1) {
					const remoteIns = CurrentGlobal.__FEDERATION__.__INSTANCES__[remoteInsIndex];
					remoteInsId = remoteIns.options.id || remoteInsId;
					const globalShareScopeMap = getGlobalShareScope();
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
					CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(remoteInsIndex, 1);
				}
				const { hostGlobalSnapshot } = getGlobalRemoteInfo(remote, host);
				if (hostGlobalSnapshot) {
					const remoteKey = hostGlobalSnapshot && "remotesInfo" in hostGlobalSnapshot && hostGlobalSnapshot.remotesInfo && getInfoWithoutType(hostGlobalSnapshot.remotesInfo, remote.name).key;
					if (remoteKey) {
						delete hostGlobalSnapshot.remotesInfo[remoteKey];
						if (Boolean(Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey])) delete Global.__FEDERATION__.__MANIFEST_LOADING__[remoteKey];
					}
				}
				host.moduleCache.delete(remote.name);
			}
		} catch (err) {
			logger.error(`removeRemote failed: ${err instanceof Error ? err.message : String(err)}`);
		}
	}
};

//#endregion
export { RemoteHandler };
//# sourceMappingURL=index.js.map