const require_constants = require('./constants.cjs');

//#region src/utils/semver/utils.ts
function parseRegex(source) {
	return new RegExp(source);
}
function isXVersion(version) {
	return !version || version.toLowerCase() === "x" || version === "*";
}
function pipe(...fns) {
	return (x) => fns.reduce((v, f) => f(v), x);
}
function extractComparator(comparatorString) {
	return comparatorString.match(parseRegex(require_constants.comparator));
}
function combineVersion(major, minor, patch, preRelease) {
	const mainVersion = `${major}.${minor}.${patch}`;
	if (preRelease) return `${mainVersion}-${preRelease}`;
	return mainVersion;
}

//#endregion
exports.combineVersion = combineVersion;
exports.extractComparator = extractComparator;
exports.isXVersion = isXVersion;
exports.parseRegex = parseRegex;
exports.pipe = pipe;
//# sourceMappingURL=utils.cjs.map