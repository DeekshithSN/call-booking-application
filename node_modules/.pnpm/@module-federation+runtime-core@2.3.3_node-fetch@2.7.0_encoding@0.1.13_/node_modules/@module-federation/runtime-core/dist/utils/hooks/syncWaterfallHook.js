import { error, warn } from "../logger.js";
import { isObject } from "../tool.js";
import { SyncHook } from "./syncHook.js";

//#region src/utils/hooks/syncWaterfallHook.ts
function checkReturnData(originalData, returnedData) {
	if (!isObject(returnedData)) return false;
	if (originalData !== returnedData) {
		for (const key in originalData) if (!(key in returnedData)) return false;
	}
	return true;
}
var SyncWaterfallHook = class extends SyncHook {
	constructor(type) {
		super();
		this.onerror = error;
		this.type = type;
	}
	emit(data) {
		if (!isObject(data)) error(`The data for the "${this.type}" hook should be an object.`);
		for (const fn of this.listeners) try {
			const tempData = fn(data);
			if (checkReturnData(data, tempData)) data = tempData;
			else {
				this.onerror(`A plugin returned an unacceptable value for the "${this.type}" type.`);
				break;
			}
		} catch (e) {
			warn(e);
			this.onerror(e);
		}
		return data;
	}
};

//#endregion
export { SyncWaterfallHook, checkReturnData };
//# sourceMappingURL=syncWaterfallHook.js.map