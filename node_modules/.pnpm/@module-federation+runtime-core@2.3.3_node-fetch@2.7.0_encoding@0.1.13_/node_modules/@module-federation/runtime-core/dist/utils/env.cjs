let _module_federation_sdk = require("@module-federation/sdk");

//#region src/utils/env.ts
function getBuilderId() {
	return typeof FEDERATION_BUILD_IDENTIFIER !== "undefined" ? FEDERATION_BUILD_IDENTIFIER : "";
}

//#endregion
exports.getBuilderId = getBuilderId;
//# sourceMappingURL=env.cjs.map