Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../../_virtual/_rolldown/runtime.js');
const require_lib_container_runtime_utils = require('./utils.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/container/runtime/getFederationGlobal.ts
const { Template } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack"));
function getFederationGlobal(template, runtimeGlobals, matcher, rootOutputDir, initOptionsWithoutShared) {
	const federationGlobal = require_lib_container_runtime_utils.getFederationGlobalScope(runtimeGlobals);
	const initOptionsStrWithoutShared = JSON.stringify({
		...initOptionsWithoutShared,
		remotes: initOptionsWithoutShared.remotes.filter((remote) => remote.externalType === "script")
	});
	const remoteInfos = JSON.stringify(initOptionsWithoutShared.remotes.reduce((acc, remote) => {
		const item = {
			alias: remote.alias || "",
			name: remote.name,
			entry: remote.entry || "",
			shareScope: remote.shareScope,
			externalType: remote.externalType
		};
		const key = remote.name || remote.alias || "";
		acc[key] ||= [];
		acc[key].push(item);
		return acc;
	}, {}));
	return template.asString([
		`if(!${federationGlobal}){`,
		template.indent([
			`${federationGlobal} = {`,
			template.indent([
				`initOptions: ${initOptionsStrWithoutShared},`,
				`chunkMatcher: function(chunkId) {return ${matcher}},`,
				`rootOutputDir: ${JSON.stringify(rootOutputDir || "")},`,
				`bundlerRuntimeOptions: { remotes: { remoteInfos: ${remoteInfos}, webpackRequire: ${runtimeGlobals.require},idToRemoteMap: {}, chunkMapping: {},idToExternalAndNameMapping: {} } }`
			]),
			"};"
		]),
		`${runtimeGlobals.require}.consumesLoadingData = {}`,
		`${runtimeGlobals.require}.remotesLoadingData = {}`,
		"}"
	]);
}

//#endregion
exports.default = getFederationGlobal;
//# sourceMappingURL=getFederationGlobal.js.map