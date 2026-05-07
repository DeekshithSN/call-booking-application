import { caret, caretTrim, comparatorTrim, gte0, hyphenRange, star, tilde, tildeTrim, xRange } from "./constants.js";
import { isXVersion, parseRegex } from "./utils.js";

//#region src/utils/semver/parser.ts
function parseHyphen(range) {
	return range.replace(parseRegex(hyphenRange), (_range, from, fromMajor, fromMinor, fromPatch, _fromPreRelease, _fromBuild, to, toMajor, toMinor, toPatch, toPreRelease) => {
		if (isXVersion(fromMajor)) from = "";
		else if (isXVersion(fromMinor)) from = `>=${fromMajor}.0.0`;
		else if (isXVersion(fromPatch)) from = `>=${fromMajor}.${fromMinor}.0`;
		else from = `>=${from}`;
		if (isXVersion(toMajor)) to = "";
		else if (isXVersion(toMinor)) to = `<${Number(toMajor) + 1}.0.0-0`;
		else if (isXVersion(toPatch)) to = `<${toMajor}.${Number(toMinor) + 1}.0-0`;
		else if (toPreRelease) to = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`;
		else to = `<=${to}`;
		return `${from} ${to}`.trim();
	});
}
function parseComparatorTrim(range) {
	return range.replace(parseRegex(comparatorTrim), "$1$2$3");
}
function parseTildeTrim(range) {
	return range.replace(parseRegex(tildeTrim), "$1~");
}
function parseCaretTrim(range) {
	return range.replace(parseRegex(caretTrim), "$1^");
}
function parseCarets(range) {
	return range.trim().split(/\s+/).map((rangeVersion) => rangeVersion.replace(parseRegex(caret), (_, major, minor, patch, preRelease) => {
		if (isXVersion(major)) return "";
		else if (isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
		else if (isXVersion(patch)) if (major === "0") return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
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
	return range.trim().split(/\s+/).map((rangeVersion) => rangeVersion.replace(parseRegex(tilde), (_, major, minor, patch, preRelease) => {
		if (isXVersion(major)) return "";
		else if (isXVersion(minor)) return `>=${major}.0.0 <${Number(major) + 1}.0.0-0`;
		else if (isXVersion(patch)) return `>=${major}.${minor}.0 <${major}.${Number(minor) + 1}.0-0`;
		else if (preRelease) return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${Number(minor) + 1}.0-0`;
		return `>=${major}.${minor}.${patch} <${major}.${Number(minor) + 1}.0-0`;
	})).join(" ");
}
function parseXRanges(range) {
	return range.split(/\s+/).map((rangeVersion) => rangeVersion.trim().replace(parseRegex(xRange), (ret, gtlt, major, minor, patch, preRelease) => {
		const isXMajor = isXVersion(major);
		const isXMinor = isXMajor || isXVersion(minor);
		const isXPatch = isXMinor || isXVersion(patch);
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
	return range.trim().replace(parseRegex(star), "");
}
function parseGTE0(comparatorString) {
	return comparatorString.trim().replace(parseRegex(gte0), "");
}

//#endregion
export { parseCaretTrim, parseCarets, parseComparatorTrim, parseGTE0, parseHyphen, parseStar, parseTildeTrim, parseTildes, parseXRanges };
//# sourceMappingURL=parser.js.map