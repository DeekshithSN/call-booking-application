Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_getShortErrorMsg = require('./getShortErrorMsg.cjs');

//#region src/browser.ts
function logAndReport(code, descMap, args, logger, originalErrorMsg, context) {
	return logger(require_getShortErrorMsg.getShortErrorMsg(code, descMap, args, originalErrorMsg));
}

//#endregion
exports.logAndReport = logAndReport;
//# sourceMappingURL=browser.cjs.map