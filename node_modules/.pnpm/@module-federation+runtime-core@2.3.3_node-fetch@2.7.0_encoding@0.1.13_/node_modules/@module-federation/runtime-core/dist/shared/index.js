import { assert, error } from "../utils/logger.js";
import { DEFAULT_SCOPE } from "../constant.js";
import { addUseIn, directShare, formatShareConfigs, getGlobalShareScope, getRegisteredShare, getTargetSharedOptions, shouldUseTreeShaking } from "../utils/share.js";
import { optionsToMFContext } from "../utils/context.js";
import "../utils/index.js";
import { AsyncHook } from "../utils/hooks/asyncHook.js";
import { SyncWaterfallHook } from "../utils/hooks/syncWaterfallHook.js";
import { AsyncWaterfallHook } from "../utils/hooks/asyncWaterfallHooks.js";
import { PluginSystem } from "../utils/hooks/pluginSystem.js";
import "../utils/hooks/index.js";
import { RUNTIME_005, RUNTIME_006, runtimeDescMap } from "@module-federation/error-codes";

//#region src/shared/index.ts
var SharedHandler = class {
	constructor(host) {
		this.hooks = new PluginSystem({
			beforeRegisterShare: new SyncWaterfallHook("beforeRegisterShare"),
			afterResolve: new AsyncWaterfallHook("afterResolve"),
			beforeLoadShare: new AsyncWaterfallHook("beforeLoadShare"),
			loadShare: new AsyncHook(),
			resolveShare: new SyncWaterfallHook("resolveShare"),
			initContainerShareScopeMap: new SyncWaterfallHook("initContainerShareScopeMap")
		});
		this.host = host;
		this.shareScopeMap = {};
		this.initTokens = {};
		this._setGlobalShareScopeMap(host.options);
	}
	registerShared(globalOptions, userOptions) {
		const { newShareInfos, allShareInfos } = formatShareConfigs(globalOptions, userOptions);
		Object.keys(newShareInfos).forEach((sharedKey) => {
			newShareInfos[sharedKey].forEach((sharedVal) => {
				sharedVal.scope.forEach((sc) => {
					this.hooks.lifecycle.beforeRegisterShare.emit({
						origin: this.host,
						pkgName: sharedKey,
						shared: sharedVal
					});
					if (!this.shareScopeMap[sc]?.[sharedKey]) this.setShared({
						pkgName: sharedKey,
						lib: sharedVal.lib,
						get: sharedVal.get,
						loaded: sharedVal.loaded || Boolean(sharedVal.lib),
						shared: sharedVal,
						from: userOptions.name
					});
				});
			});
		});
		return {
			newShareInfos,
			allShareInfos
		};
	}
	async loadShare(pkgName, extraOptions) {
		const { host } = this;
		const shareOptions = getTargetSharedOptions({
			pkgName,
			extraOptions,
			shareInfos: host.options.shared
		});
		if (shareOptions?.scope) await Promise.all(shareOptions.scope.map(async (shareScope) => {
			await Promise.all(this.initializeSharing(shareScope, { strategy: shareOptions.strategy }));
		}));
		const { shareInfo: shareOptionsRes } = await this.hooks.lifecycle.beforeLoadShare.emit({
			pkgName,
			shareInfo: shareOptions,
			shared: host.options.shared,
			origin: host
		});
		assert(shareOptionsRes, `Cannot find shared "${pkgName}" in host "${host.options.name}". Ensure the shared config for "${pkgName}" is declared in the federation plugin options and the host has been initialized before loading shares.`);
		const { shared: registeredShared, useTreesShaking } = getRegisteredShare(this.shareScopeMap, pkgName, shareOptionsRes, this.hooks.lifecycle.resolveShare) || {};
		if (registeredShared) {
			const targetShared = directShare(registeredShared, useTreesShaking);
			if (targetShared.lib) {
				addUseIn(targetShared, host.options.name);
				return targetShared.lib;
			} else if (targetShared.loading && !targetShared.loaded) {
				const factory = await targetShared.loading;
				targetShared.loaded = true;
				if (!targetShared.lib) targetShared.lib = factory;
				addUseIn(targetShared, host.options.name);
				return factory;
			} else {
				const asyncLoadProcess = async () => {
					const factory = await targetShared.get();
					addUseIn(targetShared, host.options.name);
					targetShared.loaded = true;
					targetShared.lib = factory;
					return factory;
				};
				const loading = asyncLoadProcess();
				this.setShared({
					pkgName,
					loaded: false,
					shared: registeredShared,
					from: host.options.name,
					lib: null,
					loading,
					treeShaking: useTreesShaking ? targetShared : void 0
				});
				return loading;
			}
		} else {
			if (extraOptions?.customShareInfo) return false;
			const _useTreeShaking = shouldUseTreeShaking(shareOptionsRes.treeShaking);
			const targetShared = directShare(shareOptionsRes, _useTreeShaking);
			const asyncLoadProcess = async () => {
				const factory = await targetShared.get();
				targetShared.lib = factory;
				targetShared.loaded = true;
				addUseIn(targetShared, host.options.name);
				const { shared: gShared, useTreesShaking: gUseTreeShaking } = getRegisteredShare(this.shareScopeMap, pkgName, shareOptionsRes, this.hooks.lifecycle.resolveShare) || {};
				if (gShared) {
					const targetGShared = directShare(gShared, gUseTreeShaking);
					targetGShared.lib = factory;
					targetGShared.loaded = true;
					gShared.from = shareOptionsRes.from;
				}
				return factory;
			};
			const loading = asyncLoadProcess();
			this.setShared({
				pkgName,
				loaded: false,
				shared: shareOptionsRes,
				from: host.options.name,
				lib: null,
				loading,
				treeShaking: _useTreeShaking ? targetShared : void 0
			});
			return loading;
		}
	}
	/**
	* This function initializes the sharing sequence (executed only once per share scope).
	* It accepts one argument, the name of the share scope.
	* If the share scope does not exist, it creates one.
	*/
	initializeSharing(shareScopeName = DEFAULT_SCOPE, extraOptions) {
		const { host } = this;
		const from = extraOptions?.from;
		const strategy = extraOptions?.strategy;
		let initScope = extraOptions?.initScope;
		const promises = [];
		if (from !== "build") {
			const { initTokens } = this;
			if (!initScope) initScope = [];
			let initToken = initTokens[shareScopeName];
			if (!initToken) initToken = initTokens[shareScopeName] = { from: this.host.name };
			if (initScope.indexOf(initToken) >= 0) return promises;
			initScope.push(initToken);
		}
		const shareScope = this.shareScopeMap;
		const hostName = host.options.name;
		if (!shareScope[shareScopeName]) shareScope[shareScopeName] = {};
		const scope = shareScope[shareScopeName];
		const register = (name, shared) => {
			const { version, eager } = shared;
			scope[name] = scope[name] || {};
			const versions = scope[name];
			const activeVersion = versions[version] && directShare(versions[version]);
			const activeVersionEager = Boolean(activeVersion && ("eager" in activeVersion && activeVersion.eager || "shareConfig" in activeVersion && activeVersion.shareConfig?.eager));
			if (!activeVersion || activeVersion.strategy !== "loaded-first" && !activeVersion.loaded && (Boolean(!eager) !== !activeVersionEager ? eager : hostName > versions[version].from)) versions[version] = shared;
		};
		const initRemoteModule = async (key) => {
			const { module } = await host.remoteHandler.getRemoteModuleAndOptions({ id: key });
			let remoteEntryExports = void 0;
			try {
				remoteEntryExports = await module.getEntry();
			} catch (error) {
				remoteEntryExports = await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
					id: key,
					error,
					from: "runtime",
					lifecycle: "beforeLoadShare",
					origin: host
				});
				if (!remoteEntryExports) return;
			} finally {
				if (remoteEntryExports?.init && !module.initing) {
					module.remoteEntryExports = remoteEntryExports;
					await module.init(void 0, void 0, initScope);
				}
			}
		};
		Object.keys(host.options.shared).forEach((shareName) => {
			host.options.shared[shareName].forEach((shared) => {
				if (shared.scope.includes(shareScopeName)) register(shareName, shared);
			});
		});
		if (host.options.shareStrategy === "version-first" || strategy === "version-first") host.options.remotes.forEach((remote) => {
			if (remote.shareScope === shareScopeName) promises.push(initRemoteModule(remote.name));
		});
		return promises;
	}
	loadShareSync(pkgName, extraOptions) {
		const { host } = this;
		const shareOptions = getTargetSharedOptions({
			pkgName,
			extraOptions,
			shareInfos: host.options.shared
		});
		if (shareOptions?.scope) shareOptions.scope.forEach((shareScope) => {
			this.initializeSharing(shareScope, { strategy: shareOptions.strategy });
		});
		const { shared: registeredShared, useTreesShaking } = getRegisteredShare(this.shareScopeMap, pkgName, shareOptions, this.hooks.lifecycle.resolveShare) || {};
		if (registeredShared) {
			if (typeof registeredShared.lib === "function") {
				addUseIn(registeredShared, host.options.name);
				if (!registeredShared.loaded) {
					registeredShared.loaded = true;
					if (registeredShared.from === host.options.name) shareOptions.loaded = true;
				}
				return registeredShared.lib;
			}
			if (typeof registeredShared.get === "function") {
				const module = registeredShared.get();
				if (!(module instanceof Promise)) {
					addUseIn(registeredShared, host.options.name);
					this.setShared({
						pkgName,
						loaded: true,
						from: host.options.name,
						lib: module,
						shared: registeredShared
					});
					return module;
				}
			}
		}
		if (shareOptions.lib) {
			if (!shareOptions.loaded) shareOptions.loaded = true;
			return shareOptions.lib;
		}
		if (shareOptions.get) {
			const module = shareOptions.get();
			if (module instanceof Promise) error(extraOptions?.from === "build" ? RUNTIME_005 : RUNTIME_006, runtimeDescMap, {
				hostName: host.options.name,
				sharedPkgName: pkgName
			}, void 0, optionsToMFContext(host.options));
			shareOptions.lib = module;
			this.setShared({
				pkgName,
				loaded: true,
				from: host.options.name,
				lib: shareOptions.lib,
				shared: shareOptions
			});
			return shareOptions.lib;
		}
		error(RUNTIME_006, runtimeDescMap, {
			hostName: host.options.name,
			sharedPkgName: pkgName
		}, void 0, optionsToMFContext(host.options));
	}
	initShareScopeMap(scopeName, shareScope, extraOptions = {}) {
		const { host } = this;
		this.shareScopeMap[scopeName] = shareScope;
		this.hooks.lifecycle.initContainerShareScopeMap.emit({
			shareScope,
			options: host.options,
			origin: host,
			scopeName,
			hostShareScopeMap: extraOptions.hostShareScopeMap
		});
	}
	setShared({ pkgName, shared, from, lib, loading, loaded, get, treeShaking }) {
		const { version, scope = "default", ...shareInfo } = shared;
		const scopes = Array.isArray(scope) ? scope : [scope];
		const mergeAttrs = (shared) => {
			const merge = (s, key, val) => {
				if (val && !s[key]) s[key] = val;
			};
			const targetShared = treeShaking ? shared.treeShaking : shared;
			merge(targetShared, "loaded", loaded);
			merge(targetShared, "loading", loading);
			merge(targetShared, "get", get);
		};
		scopes.forEach((sc) => {
			if (!this.shareScopeMap[sc]) this.shareScopeMap[sc] = {};
			if (!this.shareScopeMap[sc][pkgName]) this.shareScopeMap[sc][pkgName] = {};
			if (!this.shareScopeMap[sc][pkgName][version]) this.shareScopeMap[sc][pkgName][version] = {
				version,
				scope: [sc],
				...shareInfo,
				lib
			};
			const registeredShared = this.shareScopeMap[sc][pkgName][version];
			mergeAttrs(registeredShared);
			if (from && registeredShared.from !== from) registeredShared.from = from;
		});
	}
	_setGlobalShareScopeMap(hostOptions) {
		const globalShareScopeMap = getGlobalShareScope();
		const identifier = hostOptions.id || hostOptions.name;
		if (identifier && !globalShareScopeMap[identifier]) globalShareScopeMap[identifier] = this.shareScopeMap;
	}
};

//#endregion
export { SharedHandler };
//# sourceMappingURL=index.js.map