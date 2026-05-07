const require_constant = require('./constant.cjs');
const require_env = require('./env.cjs');

//#region src/utils.ts
const LOG_CATEGORY = "[ Federation Runtime ]";
const parseEntry = (str, devVerOrUrl, separator = require_constant.SEPARATOR) => {
	const strSplit = str.split(separator);
	const devVersionOrUrl = require_env.getProcessEnv()["NODE_ENV"] === "development" && devVerOrUrl;
	const defaultVersion = "*";
	const isEntry = (s) => s.startsWith("http") || s.includes(require_constant.MANIFEST_EXT);
	if (strSplit.length >= 2) {
		let [name, ...versionOrEntryArr] = strSplit;
		if (str.startsWith(separator)) {
			name = strSplit.slice(0, 2).join(separator);
			versionOrEntryArr = [devVersionOrUrl || strSplit.slice(2).join(separator)];
		}
		let versionOrEntry = devVersionOrUrl || versionOrEntryArr.join(separator);
		if (isEntry(versionOrEntry)) return {
			name,
			entry: versionOrEntry
		};
		else return {
			name,
			version: versionOrEntry || defaultVersion
		};
	} else if (strSplit.length === 1) {
		const [name] = strSplit;
		if (devVersionOrUrl && isEntry(devVersionOrUrl)) return {
			name,
			entry: devVersionOrUrl
		};
		return {
			name,
			version: devVersionOrUrl || defaultVersion
		};
	} else throw `Invalid entry value: ${str}`;
};
const composeKeyWithSeparator = function(...args) {
	if (!args.length) return "";
	return args.reduce((sum, cur) => {
		if (!cur) return sum;
		if (!sum) return cur;
		return `${sum}${require_constant.SEPARATOR}${cur}`;
	}, "");
};
const encodeName = function(name, prefix = "", withExt = false) {
	try {
		const ext = withExt ? ".js" : "";
		return `${prefix}${name.replace(new RegExp(`${require_constant.NameTransformSymbol.AT}`, "g"), require_constant.NameTransformMap[require_constant.NameTransformSymbol.AT]).replace(new RegExp(`${require_constant.NameTransformSymbol.HYPHEN}`, "g"), require_constant.NameTransformMap[require_constant.NameTransformSymbol.HYPHEN]).replace(new RegExp(`${require_constant.NameTransformSymbol.SLASH}`, "g"), require_constant.NameTransformMap[require_constant.NameTransformSymbol.SLASH])}${ext}`;
	} catch (err) {
		throw err;
	}
};
const decodeName = function(name, prefix, withExt) {
	try {
		let decodedName = name;
		if (prefix) {
			if (!decodedName.startsWith(prefix)) return decodedName;
			decodedName = decodedName.replace(new RegExp(prefix, "g"), "");
		}
		decodedName = decodedName.replace(new RegExp(`${require_constant.NameTransformMap[require_constant.NameTransformSymbol.AT]}`, "g"), require_constant.EncodedNameTransformMap[require_constant.NameTransformMap[require_constant.NameTransformSymbol.AT]]).replace(new RegExp(`${require_constant.NameTransformMap[require_constant.NameTransformSymbol.SLASH]}`, "g"), require_constant.EncodedNameTransformMap[require_constant.NameTransformMap[require_constant.NameTransformSymbol.SLASH]]).replace(new RegExp(`${require_constant.NameTransformMap[require_constant.NameTransformSymbol.HYPHEN]}`, "g"), require_constant.EncodedNameTransformMap[require_constant.NameTransformMap[require_constant.NameTransformSymbol.HYPHEN]]);
		if (withExt) decodedName = decodedName.replace(".js", "");
		return decodedName;
	} catch (err) {
		throw err;
	}
};
const generateExposeFilename = (exposeName, withExt) => {
	if (!exposeName) return "";
	let expose = exposeName;
	if (expose === ".") expose = "default_export";
	if (expose.startsWith("./")) expose = expose.replace("./", "");
	return encodeName(expose, "__federation_expose_", withExt);
};
const generateShareFilename = (pkgName, withExt) => {
	if (!pkgName) return "";
	return encodeName(pkgName, "__federation_shared_", withExt);
};
const getResourceUrl = (module, sourceUrl) => {
	if ("getPublicPath" in module) {
		let publicPath;
		if (!module.getPublicPath.startsWith("function")) publicPath = new Function(module.getPublicPath)();
		else publicPath = new Function("return " + module.getPublicPath)()();
		return `${publicPath}${sourceUrl}`;
	} else if ("publicPath" in module) {
		if (!require_env.isBrowserEnv() && !require_env.isReactNativeEnv() && "ssrPublicPath" in module && typeof module.ssrPublicPath === "string") return `${module.ssrPublicPath}${sourceUrl}`;
		return `${module.publicPath}${sourceUrl}`;
	} else {
		console.warn("Cannot get resource URL. If in debug mode, please ignore.", module, sourceUrl);
		return "";
	}
};
const assert = (condition, msg) => {
	if (!condition) error(msg);
};
const error = (msg) => {
	throw new Error(`${LOG_CATEGORY}: ${msg}`);
};
const warn = (msg) => {
	console.warn(`${LOG_CATEGORY}: ${msg}`);
};
function safeToString(info) {
	try {
		return JSON.stringify(info, null, 2);
	} catch (e) {
		return "";
	}
}
const VERSION_PATTERN_REGEXP = /^([\d^=v<>~]|[*xX]$)/;
function isRequiredVersion(str) {
	return VERSION_PATTERN_REGEXP.test(str);
}

//#endregion
exports.assert = assert;
exports.composeKeyWithSeparator = composeKeyWithSeparator;
exports.decodeName = decodeName;
exports.encodeName = encodeName;
exports.error = error;
exports.generateExposeFilename = generateExposeFilename;
exports.generateShareFilename = generateShareFilename;
exports.getResourceUrl = getResourceUrl;
exports.isRequiredVersion = isRequiredVersion;
exports.parseEntry = parseEntry;
exports.safeToString = safeToString;
exports.warn = warn;
//# sourceMappingURL=utils.cjs.map