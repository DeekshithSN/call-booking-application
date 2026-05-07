const require_constants = require('./constants.cjs');
const require_utils = require('./utils.cjs');

//#region src/utils/semver/parser.ts
function parseHyphen(range) {
	return range.replace(require_utils.parseRegex(require_constants.hyphenRange), (_range, from, fromMajor, fromMinor, fromPatch, _fromPreRelease, _fromBuild, to, toMajor, toMinor, toPatch, toPreRelease) => {
		if (require_utils.isXVersion(fromMajor)) from = "";
		else if (require_utils.isXVersion(fromMinor)) from = `>=${fromMajor}.0.0`;
		else if (require_utils.isXVersion(fromPatch)) from = `>=${fromMajor}.${fromMinor}.0`;
		else from = `>=${from}`;
		if (require_utils.isXVersion(toMajor)) to = "";
		else if (require_utils.isXVersion(toMinor)) to = `<${Number(toMajor) + 1}.0.0-0`;
		else if (require_utils.isXVersion(toPatch)) to = `<${toMajor}.${Number(toMinor) + 1}.0-0`;
		else if (toPreRelease) to = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`;
		else to = `<=${to}`;
		return `${from} ${to}`.trim();
	});
}
function parseComparatorTrim(range) {
	return range.replace(require_utils.parseRegex(require_constants.comparatorTrim), "$1$2$3");
}
function parseTildeTrim(range) {
	return range.replace(require_utils.parseRegex(require_constants.tildeTrim), "$1~");
}
function parseCaretTrim(range) {
	return range.replace(require_utils.parseRegex(require_constants.caretTrim), "$1^");
}
function parseCarets(range) {
	return range.trim().split(/\s+/).map((rangeVersion) => rangeVersion.replace(require_utils.parseRegex(require_constants.caret), (_, major, minor, patch, preRelease) => {
		if (require_utils.isXVersion(major)) return "";
		else if (require_utils.isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
		else if (require_utils.isXVersion(patch)) if (major === "0") return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
		else return `>=${major}.${minor}.0 <${Number(major) + 1}.0.0-0`;
		else if (preRelease) if (major === "0") if (minor === "0") return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${minor}.${Number(patch) + 1}-0`;
		else return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
		else return `>=${major}.${minor}.${patch}-${preRelease} <${Number(major) + 1}.0.0-0`;
		else {
			if (major === "0") if (minor === "0") return `>=${major}.${minor}.${patch} <${major}.${minor}.${Number(patch) + 1}-0`;
			else return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
			return `>=${major}.${minor}.${patch} <${Number(major) + 1}.0.0-0`;
		}
	})).join(" ");
}
function parseTildes(range) {
	return range.trim().split(/\s+/).map((rangeVersion) => rangeVersion.replace(require_utils.parseRegex(require_constants.tilde), (_, major, minor, patch, preRelease) => {
		if (require_utils.isXVersion(major)) return "";
		else if (require_utils.isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
		else if (require_utils.isXVersion(patch)) return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
		else if (preRelease) return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
		return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
	})).join(" ");
}
function parseXRanges(range) {
	return range.split(/\s+/).map((rangeVersion) => rangeVersion.trim().replace(require_utils.parseRegex(require_constants.xRange), (ret, gtlt, major, minor, patch, preRelease) => {
		const isXMajor = require_utils.isXVersion(major);
		const isXMinor = isXMajor || require_utils.isXVersion(minor);
		const isXPatch = isXMinor || require_utils.isXVersion(patch);
		if (gtlt === "=" && isXPatch) gtlt = "";
		preRelease = "";
		if (isXMajor) if (gtlt === ">" || gtlt === "<") return "<0.0.0-0";
		else return "*";
		else if (gtlt && isXPatch) {
			if (isXMinor) minor = 0;
			patch = 0;
			if (gtlt === ">") {
				gtlt = ">=";
				if (isXMinor) {
					major = Number(major) + 1;
					minor = 0;
					patch = 0;
				} else {
					minor = Number(minor) + 1;
					patch = 0;
				}
			} else if (gtlt === "<=") {
				gtlt = "<";
				if (isXMinor) major = Number(major) + 1;
				else minor = Number(minor) + 1;
			}
			if (gtlt === "<") preRelease = "-0";
			return `${gtlt + major}.${minor}.${patch}${preRelease}`;
		} else if (isXMinor) return `>=${major}.0.0${preRelease} <${Number(major) + 1}.0.0-0`;
		else if (isXPatch) return `>=${major}.${minor}.0${preRelease} <${major}.${Number(minor) + 1}.0-0`;
		return ret;
	})).join(" ");
}
function parseStar(range) {
	return range.trim().replace(require_utils.parseRegex(require_constants.star), "");
}
function parseGTE0(comparatorString) {
	return comparatorString.trim().replace(require_utils.parseRegex(require_constants.gte0), "");
}

//#endregion
exports.parseCaretTrim = parseCaretTrim;
exports.parseCarets = parseCarets;
exports.parseComparatorTrim = parseComparatorTrim;
exports.parseGTE0 = parseGTE0;
exports.parseHyphen = parseHyphen;
exports.parseStar = parseStar;
exports.parseTildeTrim = parseTildeTrim;
exports.parseTildes = parseTildes;
exports.parseXRanges = parseXRanges;
//# sourceMappingURL=parser.cjs.map