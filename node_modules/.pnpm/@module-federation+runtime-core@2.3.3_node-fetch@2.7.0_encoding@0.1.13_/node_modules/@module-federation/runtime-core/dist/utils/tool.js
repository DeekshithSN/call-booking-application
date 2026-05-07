import { warn as warn$1 } from "./logger.js";
import { isBrowserEnvValue, isReactNativeEnv } from "@module-federation/sdk";

//#region src/utils/tool.ts
function addUniqueItem(arr, item) {
	if (arr.findIndex((name) => name === item) === -1) arr.push(item);
	return arr;
}
function getFMId(remoteInfo) {
	if ("version" in remoteInfo && remoteInfo.version) return `${remoteInfo.name}:${remoteInfo.version}`;
	else if ("entry" in remoteInfo && remoteInfo.entry) return `${remoteInfo.name}:${remoteInfo.entry}`;
	else return `${remoteInfo.name}`;
}
function isRemoteInfoWithEntry(remote) {
	return typeof remote.entry !== "undefined";
}
function isPureRemoteEntry(remote) {
	return !remote.entry.includes(".json");
}
async function safeWrapper(callback, disableWarn) {
	try {
		return await callback();
	} catch (e) {
		!disableWarn && warn$1(e);
		return;
	}
}
function isObject(val) {
	return val && typeof val === "object";
}
const objectToString = Object.prototype.toString;
function isPlainObject(val) {
	return objectToString.call(val) === "[object Object]";
}
function isStaticResourcesEqual(url1, url2) {
	const REG_EXP = /^(https?:)?\/\//i;
	return url1.replace(REG_EXP, "").replace(/\/$/, "") === url2.replace(REG_EXP, "").replace(/\/$/, "");
}
function arrayOptions(options) {
	return Array.isArray(options) ? options : [options];
}
function getRemoteEntryInfoFromSnapshot(snapshot) {
	const defaultRemoteEntryInfo = {
		url: "",
		type: "global",
		globalName: ""
	};
	if (isBrowserEnvValue || isReactNativeEnv() || !("ssrRemoteEntry" in snapshot)) return "remoteEntry" in snapshot ? {
		url: snapshot.remoteEntry,
		type: snapshot.remoteEntryType,
		globalName: snapshot.globalName
	} : defaultRemoteEntryInfo;
	if ("ssrRemoteEntry" in snapshot) return {
		url: snapshot.ssrRemoteEntry || defaultRemoteEntryInfo.url,
		type: snapshot.ssrRemoteEntryType || defaultRemoteEntryInfo.type,
		globalName: snapshot.globalName
	};
	return defaultRemoteEntryInfo;
}
const processModuleAlias = (name, subPath) => {
	let moduleName;
	if (name.endsWith("/")) moduleName = name.slice(0, -1);
	else moduleName = name;
	if (subPath.startsWith(".")) subPath = subPath.slice(1);
	moduleName = moduleName + subPath;
	return moduleName;
};

//#endregion
export { addUniqueItem, arrayOptions, getFMId, getRemoteEntryInfoFromSnapshot, isObject, isPlainObject, isPureRemoteEntry, isRemoteInfoWithEntry, isStaticResourcesEqual, objectToString, processModuleAlias, safeWrapper };
//# sourceMappingURL=tool.js.map