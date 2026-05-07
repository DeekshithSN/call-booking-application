Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_runtime = require('../../_virtual/_rolldown/runtime.js');
let _module_federation_sdk = require("@module-federation/sdk");
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/sharing/utils.ts
const { join, dirname, readJson } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack/lib/util/fs"));
const { WebpackError } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack"));
const RE_URL_GITHUB_EXTREME_SHORT = /^[^/@:.\s][^/@:\s]*\/[^@:\s]*[^/@:\s]#\S+/;
const RE_GIT_URL_SHORT = /^(github|gitlab|bitbucket|gist):\/?[^/.]+\/?/i;
const RE_PROTOCOL = /^((git\+)?(ssh|https?|file)|git|github|gitlab|bitbucket|gist):$/i;
const RE_CUSTOM_PROTOCOL = /^((git\+)?(ssh|https?|file)|git):\/\//i;
const RE_URL_HASH_VERSION = /#(?:semver:)?(.+)/;
const RE_HOSTNAME = /^(?:[^/.]+(\.[^/]+)+|localhost)$/;
const RE_HOSTNAME_WITH_COLON = /([^/@#:.]+(?:\.[^/@#:.]+)+|localhost):([^#/0-9]+)/;
const RE_NO_PROTOCOL = /^([^/@#:.]+(?:\.[^/@#:.]+)+)/;
const PROTOCOLS_FOR_SHORT = [
	"github:",
	"gitlab:",
	"bitbucket:",
	"gist:",
	"file:"
];
const DEF_GIT_PROTOCOL = "git+ssh://";
const extractCommithashByDomain = {
	"github.com": (pathname, hash) => {
		const [, user, project, type, commithash] = pathname.split("/", 5);
		if (type && type !== "tree") return;
		let commithashResult = commithash;
		if (!type) commithashResult = hash;
		else commithashResult = "#" + commithash;
		let projectResult = project;
		if (project && project.endsWith(".git")) projectResult = project.slice(0, -4);
		if (!user || !projectResult) return;
		return commithashResult;
	},
	"gitlab.com": (pathname, hash) => {
		const path = pathname.slice(1);
		if (path.includes("/-/") || path.includes("/archive.tar.gz")) return;
		const segments = path.split("/");
		let project = segments.pop();
		if (project && project.endsWith(".git")) project = project.slice(0, -4);
		if (!segments.join("/") || !project) return;
		return hash;
	},
	"bitbucket.org": (pathname, hash) => {
		const [, user, project, aux] = pathname.split("/", 4);
		if (["get"].includes(aux)) return;
		let projectResult = project;
		if (project && project.endsWith(".git")) projectResult = project.slice(0, -4);
		if (!user || !projectResult) return;
		return hash;
	},
	"gist.github.com": (pathname, hash) => {
		const [, user, project, aux] = pathname.split("/", 4);
		if (aux === "raw") return;
		let projectResult = project;
		if (!projectResult) {
			if (!user) return;
			projectResult = user;
		}
		if (projectResult.endsWith(".git")) projectResult = projectResult.slice(0, -4);
		return hash;
	}
};
/**
* extract commit hash from parsed url
*
* @inner
* @param {URL} urlParsed parsed url
* @returns {string} commithash
*/
function getCommithash(urlParsed) {
	const { hostname, pathname, hash } = urlParsed;
	const hostnameResult = hostname.replace(/^www\./, "");
	let hashResult = hash;
	try {
		hashResult = decodeURIComponent(hash);
	} catch (e) {}
	if (extractCommithashByDomain[hostnameResult]) return extractCommithashByDomain[hostnameResult](pathname, hashResult) || "";
	return hashResult;
}
/**
* make url right for URL parse
*
* @inner
* @param {string} gitUrl git url
* @returns {string} fixed url
*/
function correctUrl(gitUrl) {
	return gitUrl.replace(RE_HOSTNAME_WITH_COLON, "$1/$2");
}
/**
* make url protocol right for URL parse
*
* @inner
* @param {string} gitUrl git url
* @returns {string} fixed url
*/
function correctProtocol(gitUrl) {
	if (RE_GIT_URL_SHORT.test(gitUrl)) return gitUrl;
	if (!RE_CUSTOM_PROTOCOL.test(gitUrl)) return `${DEF_GIT_PROTOCOL}${gitUrl}`;
	return gitUrl;
}
/**
* extract git dep version from hash
*
* @inner
* @param {string} hash hash
* @returns {string} git dep version
*/
function getVersionFromHash(hash) {
	const matched = hash.match(RE_URL_HASH_VERSION);
	return matched && matched[1] || "";
}
/**
* if string can be decoded
*
* @inner
* @param {string} str str to be checked
* @returns {boolean} if can be decoded
*/
function canBeDecoded(str) {
	return true;
}
/**
* get right dep version from git url
*
* @inner
* @param {string} gitUrl git url
* @returns {string} dep version
*/
function getGitUrlVersion(gitUrl) {
	const oriGitUrl = gitUrl;
	if (RE_URL_GITHUB_EXTREME_SHORT.test(gitUrl)) gitUrl = "github:" + gitUrl;
	else gitUrl = correctProtocol(gitUrl);
	gitUrl = correctUrl(gitUrl);
	let parsed;
	try {
		parsed = new URL(gitUrl);
	} catch (e) {}
	if (!parsed) return "";
	const { protocol, hostname, pathname, username, password } = parsed;
	if (!RE_PROTOCOL.test(protocol)) return "";
	if (!pathname || !canBeDecoded(pathname)) return "";
	if (RE_NO_PROTOCOL.test(oriGitUrl) && !username && !password) return "";
	if (!PROTOCOLS_FOR_SHORT.includes(protocol.toLowerCase())) {
		if (!RE_HOSTNAME.test(hostname)) return "";
		const commithash = getCommithash(parsed);
		return getVersionFromHash(commithash) || commithash;
	}
	return getVersionFromHash(gitUrl);
}
/**
* @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#urls-as-dependencies
* @param {string} versionDesc version to be normalized
* @returns {string} normalized version
*/
function normalizeVersion(versionDesc) {
	versionDesc = versionDesc && versionDesc.trim() || "";
	if ((0, _module_federation_sdk.isRequiredVersion)(versionDesc)) return versionDesc;
	return getGitUrlVersion(versionDesc.toLowerCase());
}
/**
*
* @param {InputFileSystem} fs file system
* @param {string} directory directory to start looking into
* @param {string[]} descriptionFiles possible description filenames
* @param {function((Error | null)=, {data?: DescriptionFile, path?: string}=, (checkedDescriptionFilePaths: string[])=): void} callback callback
* @param {function({data: DescriptionFile}=): boolean} satisfiesDescriptionFileData file data compliance check
* @param {Set<string>} [checkedFilePaths] optional set to track checked file paths
*/
function getDescriptionFile(fs, directory, descriptionFiles, callback, satisfiesDescriptionFileData, checkedFilePaths = /* @__PURE__ */ new Set()) {
	let i = 0;
	const satisfiesDescriptionFileDataInternal = {
		check: satisfiesDescriptionFileData,
		checkedFilePaths
	};
	const tryLoadCurrent = () => {
		if (i >= descriptionFiles.length) {
			const parentDirectory = dirname(fs, directory);
			if (!parentDirectory || parentDirectory === directory) return callback(null, void 0, Array.from(satisfiesDescriptionFileDataInternal.checkedFilePaths));
			return getDescriptionFile(fs, parentDirectory, descriptionFiles, callback, satisfiesDescriptionFileDataInternal.check, satisfiesDescriptionFileDataInternal.checkedFilePaths);
		}
		const filePath = join(fs, directory, descriptionFiles[i]);
		readJson(fs, filePath, (err, data) => {
			if (err) {
				if ("code" in err && err.code === "ENOENT") {
					i++;
					return tryLoadCurrent();
				}
				return callback(err);
			}
			if (!data || typeof data !== "object" || Array.isArray(data)) return callback(/* @__PURE__ */ new Error(`Description file ${filePath} is not an object`));
			if (typeof satisfiesDescriptionFileDataInternal.check === "function" && !satisfiesDescriptionFileDataInternal.check({
				data,
				path: filePath
			})) {
				i++;
				satisfiesDescriptionFileDataInternal.checkedFilePaths.add(filePath);
				return tryLoadCurrent();
			}
			callback(null, {
				data,
				path: filePath
			});
		});
	};
	tryLoadCurrent();
}
/**
* Get required version from description file
* @param {Record<string, any>} data - The data object
* @param {string} packageName - The package name
* @returns {string | undefined} The normalized version
*/
function getRequiredVersionFromDescriptionFile(data, packageName) {
	if (data["optionalDependencies"] && typeof data["optionalDependencies"] === "object" && packageName in data["optionalDependencies"]) return normalizeVersion(data["optionalDependencies"][packageName]);
	if (data["dependencies"] && typeof data["dependencies"] === "object" && packageName in data["dependencies"]) return normalizeVersion(data["dependencies"][packageName]);
	if (data["peerDependencies"] && typeof data["peerDependencies"] === "object" && packageName in data["peerDependencies"]) return normalizeVersion(data["peerDependencies"][packageName]);
	if (data["devDependencies"] && typeof data["devDependencies"] === "object" && packageName in data["devDependencies"]) return normalizeVersion(data["devDependencies"][packageName]);
}
function normalizeConsumeShareOptions(consumeOptions) {
	const { requiredVersion = false, strictVersion, singleton = false, eager, shareKey, shareScope, layer, treeShakingMode } = consumeOptions;
	return {
		shareConfig: {
			fixedDependencies: false,
			requiredVersion,
			strictVersion,
			singleton,
			eager,
			layer
		},
		shareScope,
		shareKey,
		treeShakingMode
	};
}
function addSingletonFilterWarning(compilation, shareKey, filterType, filterProperty, filterValue, moduleRequest, moduleResource) {
	if (typeof compilation.warnings.push !== "function") return;
	const warning = new WebpackError(`"singleton: true" is used together with "${filterType}.${filterProperty}: ${filterValue instanceof RegExp ? filterValue.toString() : `"${filterValue}"`}". This might lead to multiple instances of the shared module "${shareKey}" in the shared scope.`);
	if (moduleResource) warning.file = `shared module ${moduleRequest} -> ${moduleResource}`;
	else warning.file = `shared module ${moduleRequest}`;
	compilation.warnings.push(warning);
}
function testRequestFilters(remainder, includeRequest, excludeRequest) {
	if (includeRequest && !(includeRequest instanceof RegExp ? includeRequest.test(remainder) : remainder === includeRequest)) return false;
	if (excludeRequest && (excludeRequest instanceof RegExp ? excludeRequest.test(remainder) : remainder === excludeRequest)) return false;
	return true;
}
function createLookupKeyForSharing(request, layer) {
	if (layer) return `(${layer})${request}`;
	return request;
}
function extractPathAfterNodeModules(filePath) {
	if (~filePath.indexOf("node_modules")) {
		const nodeModulesIndex = filePath.lastIndexOf("node_modules");
		return filePath.substring(nodeModulesIndex + 13);
	}
	return null;
}

//#endregion
exports.addSingletonFilterWarning = addSingletonFilterWarning;
exports.createLookupKeyForSharing = createLookupKeyForSharing;
exports.extractPathAfterNodeModules = extractPathAfterNodeModules;
exports.getDescriptionFile = getDescriptionFile;
exports.getRequiredVersionFromDescriptionFile = getRequiredVersionFromDescriptionFile;
exports.normalizeConsumeShareOptions = normalizeConsumeShareOptions;
exports.normalizeVersion = normalizeVersion;
exports.testRequestFilters = testRequestFilters;
//# sourceMappingURL=utils.js.map