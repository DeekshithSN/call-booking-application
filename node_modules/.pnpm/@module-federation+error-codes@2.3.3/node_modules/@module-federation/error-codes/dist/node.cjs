Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_runtime = require('./_virtual/_rolldown/runtime.cjs');
const require_getShortErrorMsg = require('./getShortErrorMsg.cjs');
let fs = require("fs");
fs = require_runtime.__toESM(fs);
let path = require("path");
path = require_runtime.__toESM(path);

//#region src/node.ts
function reportDiagnostic(code, message, args, context) {
	try {
		const dir = path.default.resolve(process.cwd(), ".mf", "diagnostics");
		fs.default.mkdirSync(dir, { recursive: true });
		const output = {
			...context,
			latestErrorEvent: {
				code,
				message,
				args,
				timestamp: Date.now()
			}
		};
		fs.default.writeFileSync(path.default.join(dir, "latest.json"), JSON.stringify(output, null, 2));
	} catch {}
}
function logAndReport(code, descMap, args, logger, originalErrorMsg, context) {
	const msg = require_getShortErrorMsg.getShortErrorMsg(code, descMap, args, originalErrorMsg);
	reportDiagnostic(code, msg, args, context);
	return logger(msg);
}

//#endregion
exports.logAndReport = logAndReport;
//# sourceMappingURL=node.cjs.map