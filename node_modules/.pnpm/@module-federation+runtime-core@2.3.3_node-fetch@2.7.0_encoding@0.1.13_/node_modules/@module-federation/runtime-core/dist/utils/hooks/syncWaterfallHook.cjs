const require_logger = require('../logger.cjs');
const require_tool = require('../tool.cjs');
const require_syncHook = require('./syncHook.cjs');

//#region src/utils/hooks/syncWaterfallHook.ts
function checkReturnData(originalData, returnedData) {
	if (!require_tool.isObject(returnedData)) return false;
	if (originalData !== returnedData) {
		for (const key in originalData) if (!(key in returnedData)) return false;
	}
	return true;
}
var SyncWaterfallHook = class extends require_syncHook.SyncHook {
	constructor(type) {
		super();
		this.onerror = require_logger.error;
		this.type = type;
	}
	emit(data) {
		if (!require_tool.isObject(data)) require_logger.error(`The data for the "${this.type}" hook should be an object.`);
		for (const fn of this.listeners) try {
			const tempData = fn(data);
			if (checkReturnData(data, tempData)) data = tempData;
			else {
				this.onerror(`A plugin returned an unacceptable value for the "${this.type}" type.`);
				break;
			}
		} catch (e) {
			require_logger.warn(e);
			this.onerror(e);
		}
		return data;
	}
};

//#endregion
exports.SyncWaterfallHook = SyncWaterfallHook;
exports.checkReturnData = checkReturnData;
//# sourceMappingURL=syncWaterfallHook.cjs.map