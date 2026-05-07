import { getShortErrorMsg } from "./getShortErrorMsg.mjs";

//#region src/browser.ts
function logAndReport(code, descMap, args, logger, originalErrorMsg, context) {
	return logger(getShortErrorMsg(code, descMap, args, originalErrorMsg));
}

//#endregion
export { logAndReport };
//# sourceMappingURL=browser.mjs.map