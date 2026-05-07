import { comparator } from "./constants.js";

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
	return comparatorString.match(parseRegex(comparator));
}
function combineVersion(major, minor, patch, preRelease) {
	const mainVersion = `${major}.${minor}.${patch}`;
	if (preRelease) return `${mainVersion}-${preRelease}`;
	return mainVersion;
}

//#endregion
export { combineVersion, extractComparator, isXVersion, parseRegex, pipe };
//# sourceMappingURL=utils.js.map