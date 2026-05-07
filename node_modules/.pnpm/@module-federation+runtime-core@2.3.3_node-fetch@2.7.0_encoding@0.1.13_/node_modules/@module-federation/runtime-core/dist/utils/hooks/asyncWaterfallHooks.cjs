const require_logger = require('../logger.cjs');
const require_tool = require('../tool.cjs');
const require_syncHook = require('./syncHook.cjs');
const require_syncWaterfallHook = require('./syncWaterfallHook.cjs');

//#region src/utils/hooks/asyncWaterfallHooks.ts
var AsyncWaterfallHook = class extends require_syncHook.SyncHook {
	constructor(type) {
		super();
		this.onerror = require_logger.error;
		this.type = type;
	}
	emit(data) {
		if (!require_tool.isObject(data)) require_logger.error(`The response data for the "${this.type}" hook must be an object.`);
		const ls = Array.from(this.listeners);
		if (ls.length > 0) {
			let i = 0;
			const processError = (e) => {
				require_logger.warn(e);
				this.onerror(e);
				return data;
			};
			const call = (prevData) => {
				if (require_syncWaterfallHook.checkReturnData(data, prevData)) {
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
exports.AsyncWaterfallHook = AsyncWaterfallHook;
//# sourceMappingURL=asyncWaterfallHooks.cjs.map