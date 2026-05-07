let _module_federation_sdk = require("@module-federation/sdk");
let _module_federation_error_codes_browser = require("@module-federation/error-codes/browser");

//#region src/utils/logger.ts
const LOG_CATEGORY = "[ Federation Runtime ]";
const logger = (0, _module_federation_sdk.createLogger)(LOG_CATEGORY);
function assert(condition, msgOrCode, descMap, args, context) {
	if (!condition) if (descMap !== void 0) error(msgOrCode, descMap, args, void 0, context);
	else error(msgOrCode);
}
function error(msgOrCode, descMap, args, originalErrorMsg, context) {
	if (descMap !== void 0) return (0, _module_federation_error_codes_browser.logAndReport)(msgOrCode, descMap, args ?? {}, (msg) => {
		throw new Error(`${LOG_CATEGORY}: ${msg}`);
	}, originalErrorMsg, context);
	const msg = msgOrCode;
	if (msg instanceof Error) {
		if (!msg.message.startsWith(LOG_CATEGORY)) msg.message = `${LOG_CATEGORY}: ${msg.message}`;
		throw msg;
	}
	throw new Error(`${LOG_CATEGORY}: ${msg}`);
}
function warn(msg) {
	if (msg instanceof Error) {
		if (!msg.message.startsWith(LOG_CATEGORY)) msg.message = `${LOG_CATEGORY}: ${msg.message}`;
		logger.warn(msg);
	} else logger.warn(msg);
}

//#endregion
exports.assert = assert;
exports.error = error;
exports.logger = logger;
exports.warn = warn;
//# sourceMappingURL=logger.cjs.map