import { getGlobalFederationInstance } from "./utils.js";
import { helpers } from "@module-federation/runtime-core";

//#region src/helpers.ts
const global = {
	...helpers.global,
	getGlobalFederationInstance
};
const share = helpers.share;
const utils = helpers.utils;
const runtimeHelpers = {
	global,
	share,
	utils
};

//#endregion
export { runtimeHelpers as default, global, share, utils };
//# sourceMappingURL=helpers.js.map