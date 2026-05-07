const require_constant = require('./constant.cjs');

//#region src/env.ts
const isBrowserEnvValue = typeof ENV_TARGET !== "undefined" ? ENV_TARGET === "web" : typeof window !== "undefined" && typeof window.document !== "undefined";
function isBrowserEnv() {
	return isBrowserEnvValue;
}
function isReactNativeEnv() {
	return typeof navigator !== "undefined" && navigator?.product === "ReactNative";
}
function isBrowserDebug() {
	try {
		if (isBrowserEnv() && window.localStorage) return Boolean(localStorage.getItem(require_constant.BROWSER_LOG_KEY));
	} catch (error) {
		return false;
	}
	return false;
}
function isDebugMode() {
	if (typeof process !== "undefined" && process.env && process.env["FEDERATION_DEBUG"]) return Boolean(process.env["FEDERATION_DEBUG"]);
	if (typeof FEDERATION_DEBUG !== "undefined" && Boolean(FEDERATION_DEBUG)) return true;
	return isBrowserDebug();
}
const getProcessEnv = function() {
	return typeof process !== "undefined" && process.env ? process.env : {};
};

//#endregion
exports.getProcessEnv = getProcessEnv;
exports.isBrowserEnv = isBrowserEnv;
exports.isBrowserEnvValue = isBrowserEnvValue;
exports.isDebugMode = isDebugMode;
exports.isReactNativeEnv = isReactNativeEnv;
//# sourceMappingURL=env.cjs.map