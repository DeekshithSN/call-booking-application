import { error, warn } from "../logger.js";
import { isObject } from "../tool.js";
import { SyncHook } from "./syncHook.js";
import { checkReturnData } from "./syncWaterfallHook.js";

//#region src/utils/hooks/asyncWaterfallHooks.ts
var AsyncWaterfallHook = class extends SyncHook {
	constructor(type) {
		super();
		this.onerror = error;
		this.type = type;
	}
	emit(data) {
		if (!isObject(data)) error(`The response data for the "${this.type}" hook must be an object.`);
		const ls = Array.from(this.listeners);
		if (ls.length > 0) {
			let i = 0;
			const processError = (e) => {
				warn(e);
				this.onerror(e);
				return data;
			};
			const call = (prevData) => {
				if (checkReturnData(data, prevData)) {
					data = prevData;
					if (i < ls.length) try {
						return Promise.resolve(ls[i++](data)).then(call, processError);
					} catch (e) {
						return processError(e);
					}
				} else this.onerror(`A plugin returned an incorrect value for the "${this.type}" type.`);
				return data;
			};
			return Promise.resolve(call(data));
		}
		return Promise.resolve(data);
	}
};

//#endregion
export { AsyncWaterfallHook };
//# sourceMappingURL=asyncWaterfallHooks.js.map