const require_logger = require('../utils/logger.cjs');
const require_tool = require('../utils/tool.cjs');
const require_load = require('../utils/load.cjs');
const require_context = require('../utils/context.cjs');
require('../utils/index.cjs');
let _module_federation_sdk = require("@module-federation/sdk");
let _module_federation_error_codes = require("@module-federation/error-codes");

//#region src/module/index.ts
function createRemoteEntryInitOptions(remoteInfo, hostShareScopeMap, rawInitScope) {
	const localShareScopeMap = hostShareScopeMap;
	const shareScopeKeys = Array.isArray(remoteInfo.shareScope) ? remoteInfo.shareScope : [remoteInfo.shareScope];
	if (!shareScopeKeys.length) shareScopeKeys.push("default");
	shareScopeKeys.forEach((shareScopeKey) => {
		if (!localShareScopeMap[shareScopeKey]) localShareScopeMap[shareScopeKey] = {};
	});
	const remoteEntryInitOptions = {
		version: remoteInfo.version || "",
		shareScopeKeys: Array.isArray(remoteInfo.shareScope) ? shareScopeKeys : remoteInfo.shareScope || "default"
	};
	Object.defineProperty(remoteEntryInitOptions, "shareScopeMap", {
		value: localShareScopeMap,
		enumerable: false
	});
	return {
		remoteEntryInitOptions,
		shareScope: localShareScopeMap[shareScopeKeys[0]],
		initScope: rawInitScope ?? []
	};
}
var Module = class {
	constructor({ remoteInfo, host }) {
		this.inited = false;
		this.initing = false;
		this.lib = void 0;
		this.remoteInfo = remoteInfo;
		this.host = host;
	}
	async getEntry() {
		if (this.remoteEntryExports) return this.remoteEntryExports;
		const remoteEntryExports = await require_load.getRemoteEntry({
			origin: this.host,
			remoteInfo: this.remoteInfo,
			remoteEntryExports: this.remoteEntryExports
		});
		require_logger.assert(remoteEntryExports, `remoteEntryExports is undefined \n ${(0, _module_federation_sdk.safeToString)(this.remoteInfo)}`);
		this.remoteEntryExports = remoteEntryExports;
		return this.remoteEntryExports;
	}
	async init(id, remoteSnapshot, rawInitScope) {
		const remoteEntryExports = await this.getEntry();
		if (this.inited) return remoteEntryExports;
		if (this.initPromise) {
			await this.initPromise;
			return remoteEntryExports;
		}
		this.initing = true;
		this.initPromise = (async () => {
			const { remoteEntryInitOptions, shareScope, initScope } = createRemoteEntryInitOptions(this.remoteInfo, this.host.shareScopeMap, rawInitScope);
			const initContainerOptions = await this.host.hooks.lifecycle.beforeInitContainer.emit({
				shareScope,
				remoteEntryInitOptions,
				initScope,
				remoteInfo: this.remoteInfo,
				origin: this.host
			});
			if (typeof remoteEntryExports?.init === "undefined") require_logger.error(_module_federation_error_codes.RUNTIME_002, _module_federation_error_codes.runtimeDescMap, {
				hostName: this.host.name,
				remoteName: this.remoteInfo.name,
				remoteEntryUrl: this.remoteInfo.entry,
				remoteEntryKey: this.remoteInfo.entryGlobalName
			}, void 0, require_context.optionsToMFContext(this.host.options));
			await remoteEntryExports.init(initContainerOptions.shareScope, initContainerOptions.initScope, initContainerOptions.remoteEntryInitOptions);
			await this.host.hooks.lifecycle.initContainer.emit({
				...initContainerOptions,
				id,
				remoteSnapshot,
				remoteEntryExports
			});
			this.inited = true;
		})();
		try {
			await this.initPromise;
		} finally {
			this.initing = false;
			this.initPromise = void 0;
		}
		return remoteEntryExports;
	}
	async get(id, expose, options, remoteSnapshot) {
		const { loadFactory = true } = options || { loadFactory: true };
		const remoteEntryExports = await this.init(id, remoteSnapshot);
		this.lib = remoteEntryExports;
		let moduleFactory;
		moduleFactory = await this.host.loaderHook.lifecycle.getModuleFactory.emit({
			remoteEntryExports,
			expose,
			moduleInfo: this.remoteInfo
		});
		if (!moduleFactory) moduleFactory = await remoteEntryExports.get(expose);
		require_logger.assert(moduleFactory, `${require_tool.getFMId(this.remoteInfo)} remote don't export ${expose}.`);
		const symbolName = require_tool.processModuleAlias(this.remoteInfo.name, expose);
		const wrapModuleFactory = this.wraperFactory(moduleFactory, symbolName);
		if (!loadFactory) return wrapModuleFactory;
		return await wrapModuleFactory();
	}
	wraperFactory(moduleFactory, id) {
		function defineModuleId(res, id) {
			if (res && typeof res === "object" && Object.isExtensible(res) && !Object.getOwnPropertyDescriptor(res, Symbol.for("mf_module_id"))) Object.defineProperty(res, Symbol.for("mf_module_id"), {
				value: id,
				enumerable: false
			});
		}
		if (moduleFactory instanceof Promise) return async () => {
			const res = await moduleFactory();
			defineModuleId(res, id);
			return res;
		};
		else return () => {
			const res = moduleFactory();
			defineModuleId(res, id);
			return res;
		};
	}
};

//#endregion
exports.Module = Module;
//# sourceMappingURL=index.cjs.map