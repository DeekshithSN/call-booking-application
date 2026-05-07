import { CurrentGlobal } from "@module-federation/runtime-core";

//#region src/utils.ts
function getBuilderId() {
	return typeof FEDERATION_BUILD_IDENTIFIER !== "undefined" ? FEDERATION_BUILD_IDENTIFIER : "";
}
function getGlobalFederationInstance(name, version) {
	const buildId = getBuilderId();
	return CurrentGlobal.__FEDERATION__.__INSTANCES__.find((GMInstance) => {
		if (buildId && GMInstance.options.id === buildId) return true;
		if (GMInstance.options.name === name && !GMInstance.options.version && !version) return true;
		if (GMInstance.options.name === name && version && GMInstance.options.version === version) return true;
		return false;
	});
}

//#endregion
export { getGlobalFederationInstance };
//# sourceMappingURL=utils.js.map