import { createLogger } from "@module-federation/sdk";
import { logAndReport } from "@module-federation/error-codes/browser";

//#region src/utils/logger.ts
const LOG_CATEGORY = "[ Federation Runtime ]";
const logger = createLogger(LOG_CATEGORY);
function assert(condition, msgOrCode, descMap, args, context) {
	if (!condition) if (descMap !== void 0) error(msgOrCode, descMap, args, void 0, context);
	else error(msgOrCode);
}
function error(msgOrCode, descMap, args, originalErrorMsg, context) {
	if (descMap !== void 0) return logAndReport(msgOrCode, descMap, args ?? {}, (msg) => {
		throw new Error(`${LOG_CATEGORY}: ${msg}`);
	}, originalErrorMsg, context);
	const msg = msgOrCode;
	if (msg instanceof Error) {
		if (!msg.message.startsWith(LOG_CATEGORY)) msg.message = `${LOG_CATEGORY}: ${msg.message}`;
		throw msg;
	}
	throw new Error(`${LOG_CATEGORY}: ${msg}`);
}
function warn$1(msg) {
	if (msg instanceof Error) {
		if (!msg.message.startsWith(LOG_CATEGORY)) msg.message = `${LOG_CATEGORY}: ${msg.message}`;
		logger.warn(msg);
	} else logger.warn(msg);
}

//#endregion
export { assert, error, logger, warn$1 as warn };
//# sourceMappingURL=logger.js.map