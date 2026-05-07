const require_error_codes = require('./error-codes.cjs');

//#region src/desc.ts
const runtimeDescMap = {
	[require_error_codes.RUNTIME_001]: "Failed to get remoteEntry exports.",
	[require_error_codes.RUNTIME_002]: "The remote entry interface does not contain \"init\"",
	[require_error_codes.RUNTIME_003]: "Failed to get manifest.",
	[require_error_codes.RUNTIME_004]: "Failed to locate remote.",
	[require_error_codes.RUNTIME_005]: "Invalid loadShareSync function call from bundler runtime",
	[require_error_codes.RUNTIME_006]: "Invalid loadShareSync function call from runtime",
	[require_error_codes.RUNTIME_007]: "Failed to get remote snapshot.",
	[require_error_codes.RUNTIME_008]: "Failed to load script resources.",
	[require_error_codes.RUNTIME_009]: "Please call createInstance first.",
	[require_error_codes.RUNTIME_010]: "The name option cannot be changed after initialization. If you want to create a new instance with a different name, please use \"createInstance\" api.",
	[require_error_codes.RUNTIME_011]: "The remoteEntry URL is missing from the remote snapshot.",
	[require_error_codes.RUNTIME_012]: "The getter for the shared module is not a function. This may be caused by setting \"shared.import: false\" without the host providing the corresponding lib."
};
const typeDescMap = { [require_error_codes.TYPE_001]: "Failed to generate type declaration. Execute the below cmd to reproduce and fix the error." };
const buildDescMap = {
	[require_error_codes.BUILD_001]: "Failed to find expose module.",
	[require_error_codes.BUILD_002]: "PublicPath is required in prod mode."
};
const errorDescMap = {
	...runtimeDescMap,
	...typeDescMap,
	...buildDescMap
};

//#endregion
exports.buildDescMap = buildDescMap;
exports.errorDescMap = errorDescMap;
exports.runtimeDescMap = runtimeDescMap;
exports.typeDescMap = typeDescMap;
//# sourceMappingURL=desc.cjs.map