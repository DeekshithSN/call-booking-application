const require_syncHook = require('./syncHook.cjs');

//#region src/utils/hooks/asyncHook.ts
var AsyncHook = class extends require_syncHook.SyncHook {
	emit(...data) {
		let result;
		const ls = Array.from(this.listeners);
		if (ls.length > 0) {
			let i = 0;
			const call = (prev) => {
				if (prev === false) return false;
				else if (i < ls.length) return Promise.resolve(ls[i++].apply(null, data)).then(call);
				else return prev;
			};
			result = call();
		}
		return Promise.resolve(result);
	}
};

//#endregion
exports.AsyncHook = AsyncHook;
//# sourceMappingURL=asyncHook.cjs.map