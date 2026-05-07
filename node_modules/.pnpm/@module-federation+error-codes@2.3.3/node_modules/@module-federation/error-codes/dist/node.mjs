import { getShortErrorMsg } from "./getShortErrorMsg.mjs";
import fs from "fs";
import path from "path";

//#region src/node.ts
function reportDiagnostic(code, message, args, context) {
	try {
		const dir = path.resolve(process.cwd(), ".mf", "diagnostics");
		fs.mkdirSync(dir, { recursive: true });
		const output = {
			...context,
			latestErrorEvent: {
				code,
				message,
				args,
				timestamp: Date.now()
			}
		};
		fs.writeFileSync(path.join(dir, "latest.json"), JSON.stringify(output, null, 2));
	} catch {}
}
function logAndReport(code, descMap, args, logger, originalErrorMsg, context) {
	const msg = getShortErrorMsg(code, descMap, args, originalErrorMsg);
	reportDiagnostic(code, msg, args, context);
	return logger(msg);
}

//#endregion
export { logAndReport };
//# sourceMappingURL=node.mjs.map