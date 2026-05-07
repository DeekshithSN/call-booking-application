
//#region src/dev-worker/utils.ts
const DEFAULT_LOCAL_IPS = ["localhost", "127.0.0.1"];
function getIpFromEntry(entry, ipv4) {
	let ip;
	entry.replace(/https?:\/\/([0-9|.]+|localhost):/, (str, matched) => {
		ip = matched;
		return str;
	});
	if (ip) return DEFAULT_LOCAL_IPS.includes(ip) ? ipv4 : ip;
}

//#endregion
Object.defineProperty(exports, 'getIpFromEntry', {
  enumerable: true,
  get: function () {
    return getIpFromEntry;
  }
});