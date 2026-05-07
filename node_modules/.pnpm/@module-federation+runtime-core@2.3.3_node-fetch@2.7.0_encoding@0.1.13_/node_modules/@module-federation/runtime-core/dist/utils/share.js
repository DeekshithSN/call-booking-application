import { error, warn as warn$1 } from "./logger.js";
import { addUniqueItem, arrayOptions } from "./tool.js";
import { Global } from "../global.js";
import { DEFAULT_SCOPE } from "../constant.js";
import { satisfy } from "./semver/index.js";
import { TreeShakingStatus } from "@module-federation/sdk";

//#region src/utils/share.ts
function formatShare(shareArgs, from, name, shareStrategy) {
	let get;
	if ("get" in shareArgs) get = shareArgs.get;
	else if ("lib" in shareArgs) get = () => Promise.resolve(shareArgs.lib);
	else get = () => Promise.resolve(() => {
		error(`Cannot get shared "${name}" from "${from}": neither "get" nor "lib" is provided in the share config.`);
	});
	if (shareArgs.shareConfig?.eager && shareArgs.treeShaking?.mode) error(`Invalid shared config for "${name}" from "${from}": cannot use both "eager: true" and "treeShaking.mode" simultaneously. Choose one strategy.`);
	return {
		deps: [],
		useIn: [],
		from,
		loading: null,
		...shareArgs,
		shareConfig: {
			requiredVersion: `^${shareArgs.version}`,
			singleton: false,
			eager: false,
			strictVersion: false,
			...shareArgs.shareConfig
		},
		get,
		loaded: shareArgs?.loaded || "lib" in shareArgs ? true : void 0,
		version: shareArgs.version ?? "0",
		scope: Array.isArray(shareArgs.scope) ? shareArgs.scope : [shareArgs.scope ?? "default"],
		strategy: (shareArgs.strategy ?? shareStrategy) || "version-first",
		treeShaking: shareArgs.treeShaking ? {
			...shareArgs.treeShaking,
			mode: shareArgs.treeShaking.mode ?? "server-calc",
			status: shareArgs.treeShaking.status ?? TreeShakingStatus.UNKNOWN,
			useIn: []
		} : void 0
	};
}
function formatShareConfigs(prevOptions, newOptions) {
	const shareArgs = newOptions.shared || {};
	const from = newOptions.name;
	const newShareInfos = Object.keys(shareArgs).reduce((res, pkgName) => {
		const arrayShareArgs = arrayOptions(shareArgs[pkgName]);
		res[pkgName] = res[pkgName] || [];
		arrayShareArgs.forEach((shareConfig) => {
			res[pkgName].push(formatShare(shareConfig, from, pkgName, newOptions.shareStrategy));
		});
		return res;
	}, {});
	const allShareInfos = { ...prevOptions.shared };
	Object.keys(newShareInfos).forEach((shareKey) => {
		if (!allShareInfos[shareKey]) allShareInfos[shareKey] = newShareInfos[shareKey];
		else newShareInfos[shareKey].forEach((newUserSharedOptions) => {
			if (!allShareInfos[shareKey].find((sharedVal) => sharedVal.version === newUserSharedOptions.version)) allShareInfos[shareKey].push(newUserSharedOptions);
		});
	});
	return {
		allShareInfos,
		newShareInfos
	};
}
function shouldUseTreeShaking(treeShaking, usedExports) {
	if (!treeShaking) return false;
	const { status, mode } = treeShaking;
	if (status === TreeShakingStatus.NO_USE) return false;
	if (status === TreeShakingStatus.CALCULATED) return true;
	if (mode === "runtime-infer") {
		if (!usedExports) return true;
		return isMatchUsedExports(treeShaking, usedExports);
	}
	return false;
}
/**
* compare version a and b, return true if a is less than b
*/
function versionLt(a, b) {
	const transformInvalidVersion = (version) => {
		if (!Number.isNaN(Number(version))) {
			const splitArr = version.split(".");
			let validVersion = version;
			for (let i = 0; i < 3 - splitArr.length; i++) validVersion += ".0";
			return validVersion;
		}
		return version;
	};
	if (satisfy(transformInvalidVersion(a), `<=${transformInvalidVersion(b)}`)) return true;
	else return false;
}
const findVersion = (shareVersionMap, cb) => {
	const callback = cb || function(prev, cur) {
		return versionLt(prev, cur);
	};
	return Object.keys(shareVersionMap).reduce((prev, cur) => {
		if (!prev) return cur;
		if (callback(prev, cur)) return cur;
		if (prev === "0") return cur;
		return prev;
	}, 0);
};
const isLoaded = (shared) => {
	return Boolean(shared.loaded) || typeof shared.lib === "function";
};
const isLoading = (shared) => {
	return Boolean(shared.loading);
};
const isMatchUsedExports = (treeShaking, usedExports) => {
	if (!treeShaking || !usedExports) return false;
	const { usedExports: treeShakingUsedExports } = treeShaking;
	if (!treeShakingUsedExports) return false;
	if (usedExports.every((e) => treeShakingUsedExports.includes(e))) return true;
	return false;
};
function findSingletonVersionOrderByVersion(shareScopeMap, scope, pkgName, treeShaking) {
	const versions = shareScopeMap[scope][pkgName];
	let version = "";
	let useTreesShaking = shouldUseTreeShaking(treeShaking);
	const callback = function(prev, cur) {
		if (useTreesShaking) {
			if (!versions[prev].treeShaking) return true;
			if (!versions[cur].treeShaking) return false;
			return !isLoaded(versions[prev].treeShaking) && versionLt(prev, cur);
		}
		return !isLoaded(versions[prev]) && versionLt(prev, cur);
	};
	if (useTreesShaking) {
		version = findVersion(shareScopeMap[scope][pkgName], callback);
		if (version) return {
			version,
			useTreesShaking
		};
		useTreesShaking = false;
	}
	return {
		version: findVersion(shareScopeMap[scope][pkgName], callback),
		useTreesShaking
	};
}
const isLoadingOrLoaded = (shared) => {
	return isLoaded(shared) || isLoading(shared);
};
function findSingletonVersionOrderByLoaded(shareScopeMap, scope, pkgName, treeShaking) {
	const versions = shareScopeMap[scope][pkgName];
	let version = "";
	let useTreesShaking = shouldUseTreeShaking(treeShaking);
	const callback = function(prev, cur) {
		if (useTreesShaking) {
			if (!versions[prev].treeShaking) return true;
			if (!versions[cur].treeShaking) return false;
			if (isLoadingOrLoaded(versions[cur].treeShaking)) if (isLoadingOrLoaded(versions[prev].treeShaking)) return Boolean(versionLt(prev, cur));
			else return true;
			if (isLoadingOrLoaded(versions[prev].treeShaking)) return false;
		}
		if (isLoadingOrLoaded(versions[cur])) if (isLoadingOrLoaded(versions[prev])) return Boolean(versionLt(prev, cur));
		else return true;
		if (isLoadingOrLoaded(versions[prev])) return false;
		return versionLt(prev, cur);
	};
	if (useTreesShaking) {
		version = findVersion(shareScopeMap[scope][pkgName], callback);
		if (version) return {
			version,
			useTreesShaking
		};
		useTreesShaking = false;
	}
	return {
		version: findVersion(shareScopeMap[scope][pkgName], callback),
		useTreesShaking
	};
}
function getFindShareFunction(strategy) {
	if (strategy === "loaded-first") return findSingletonVersionOrderByLoaded;
	return findSingletonVersionOrderByVersion;
}
function getRegisteredShare(localShareScopeMap, pkgName, shareInfo, resolveShare) {
	if (!localShareScopeMap) return;
	const { shareConfig, scope = DEFAULT_SCOPE, strategy, treeShaking } = shareInfo;
	const scopes = Array.isArray(scope) ? scope : [scope];
	for (const sc of scopes) if (shareConfig && localShareScopeMap[sc] && localShareScopeMap[sc][pkgName]) {
		const { requiredVersion } = shareConfig;
		const { version: maxOrSingletonVersion, useTreesShaking } = getFindShareFunction(strategy)(localShareScopeMap, sc, pkgName, treeShaking);
		const defaultResolver = () => {
			const shared = localShareScopeMap[sc][pkgName][maxOrSingletonVersion];
			if (shareConfig.singleton) {
				if (typeof requiredVersion === "string" && !satisfy(maxOrSingletonVersion, requiredVersion)) {
					const msg = `Version ${maxOrSingletonVersion} from ${maxOrSingletonVersion && shared.from} of shared singleton module ${pkgName} does not satisfy the requirement of ${shareInfo.from} which needs ${requiredVersion})`;
					if (shareConfig.strictVersion) error(msg);
					else warn$1(msg);
				}
				return {
					shared,
					useTreesShaking
				};
			} else {
				if (requiredVersion === false || requiredVersion === "*") return {
					shared,
					useTreesShaking
				};
				if (satisfy(maxOrSingletonVersion, requiredVersion)) return {
					shared,
					useTreesShaking
				};
				const _usedTreeShaking = shouldUseTreeShaking(treeShaking);
				if (_usedTreeShaking) for (const [versionKey, versionValue] of Object.entries(localShareScopeMap[sc][pkgName])) {
					if (!shouldUseTreeShaking(versionValue.treeShaking, treeShaking?.usedExports)) continue;
					if (satisfy(versionKey, requiredVersion)) return {
						shared: versionValue,
						useTreesShaking: _usedTreeShaking
					};
				}
				for (const [versionKey, versionValue] of Object.entries(localShareScopeMap[sc][pkgName])) if (satisfy(versionKey, requiredVersion)) return {
					shared: versionValue,
					useTreesShaking: false
				};
			}
		};
		const params = {
			shareScopeMap: localShareScopeMap,
			scope: sc,
			pkgName,
			version: maxOrSingletonVersion,
			GlobalFederation: Global.__FEDERATION__,
			shareInfo,
			resolver: defaultResolver
		};
		return (resolveShare.emit(params) || params).resolver();
	}
}
function getGlobalShareScope() {
	return Global.__FEDERATION__.__SHARE__;
}
function getTargetSharedOptions(options) {
	const { pkgName, extraOptions, shareInfos } = options;
	const defaultResolver = (sharedOptions) => {
		if (!sharedOptions) return;
		const shareVersionMap = {};
		sharedOptions.forEach((shared) => {
			shareVersionMap[shared.version] = shared;
		});
		const callback = function(prev, cur) {
			return !isLoaded(shareVersionMap[prev]) && versionLt(prev, cur);
		};
		return shareVersionMap[findVersion(shareVersionMap, callback)];
	};
	const resolver = extraOptions?.resolver ?? defaultResolver;
	const isPlainObject = (val) => {
		return val !== null && typeof val === "object" && !Array.isArray(val);
	};
	const merge = (...sources) => {
		const out = {};
		for (const src of sources) {
			if (!src) continue;
			for (const [key, value] of Object.entries(src)) {
				const prev = out[key];
				if (isPlainObject(prev) && isPlainObject(value)) out[key] = merge(prev, value);
				else if (value !== void 0) out[key] = value;
			}
		}
		return out;
	};
	return merge(resolver(shareInfos[pkgName]), extraOptions?.customShareInfo);
}
const addUseIn = (shared, from) => {
	if (!shared.useIn) shared.useIn = [];
	addUniqueItem(shared.useIn, from);
};
function directShare(shared, useTreesShaking) {
	if (useTreesShaking && shared.treeShaking) return shared.treeShaking;
	return shared;
}

//#endregion
export { addUseIn, directShare, formatShareConfigs, getGlobalShareScope, getRegisteredShare, getTargetSharedOptions, shouldUseTreeShaking };
//# sourceMappingURL=share.js.map