import "@module-federation/sdk";

//#region src/utils/env.ts
function getBuilderId() {
	return typeof FEDERATION_BUILD_IDENTIFIER !== "undefined" ? FEDERATION_BUILD_IDENTIFIER : "";
}

//#endregion
export { getBuilderId };
//# sourceMappingURL=env.js.map