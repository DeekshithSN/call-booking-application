import { __require } from "../../_virtual/_rolldown/runtime.mjs";
import StreamingTargetPlugin from "./StreamingTargetPlugin.mjs";
import NodeFederationPlugin from "./NodeFederationPlugin.mjs";
import { getWebpackPath } from "@module-federation/sdk/normalize-webpack-path";
import { ModuleFederationPlugin } from "@module-federation/enhanced/webpack";

//#region src/plugins/UniversalFederationPlugin.ts
/**
* Importing necessary plugins and types
*/
const resolveRuntimePluginPath = () => __require.resolve("../runtimePlugin.mjs");
/**
* Class representing a UniversalFederationPlugin
*/
var UniversalFederationPlugin = class {
	/**
	* Create a UniversalFederationPlugin
	* @param {NodeFederationOptions} options - The options for the plugin
	* @param {NodeFederationContext} context - The context for the plugin
	*/
	constructor(options, context) {
		this._options = options || {};
		this.context = context || {};
		this.name = "ModuleFederationPlugin";
		if (this._options.useRuntimePlugin && this._options.isServer) {
			const runtimePluginPath = resolveRuntimePluginPath();
			this._options.runtimePlugins = this._options.runtimePlugins ? this._options.runtimePlugins.concat([runtimePluginPath]) : [runtimePluginPath];
		}
	}
	updateCompilerOptions(compiler) {
		compiler.options.output.chunkFormat = "commonjs";
		if (compiler.options.output.enabledLibraryTypes === void 0) compiler.options.output.enabledLibraryTypes = ["commonjs-module"];
		else compiler.options.output.enabledLibraryTypes.push("commonjs-module");
		const chunkFileName = compiler.options?.output?.chunkFilename;
		const uniqueName = compiler?.options?.output?.uniqueName || this._options.name;
		if (typeof chunkFileName === "string" && uniqueName && !chunkFileName.includes(uniqueName)) {
			const suffix = `-[contenthash].js`;
			compiler.options.output.chunkFilename = chunkFileName.replace(".js", suffix);
		}
	}
	/**
	* Apply the plugin to the compiler
	* @param {Compiler} compiler - The webpack compiler
	*/
	apply(compiler) {
		const { isServer, debug, useRuntimePlugin, ...options } = this._options;
		const { webpack } = compiler;
		if (!process.env["FEDERATION_WEBPACK_PATH"]) process.env["FEDERATION_WEBPACK_PATH"] = getWebpackPath(compiler);
		if (isServer || compiler.options.name === "server" || compiler.options.target === "node" || compiler.options.target === "async-node") if (useRuntimePlugin) {
			this.updateCompilerOptions(compiler);
			new ModuleFederationPlugin({ ...options }).apply(compiler);
		} else {
			new NodeFederationPlugin(options, this.context).apply(compiler);
			new StreamingTargetPlugin({
				...options,
				debug
			}).apply(compiler);
		}
		else new ModuleFederationPlugin(options).apply(compiler);
	}
};

//#endregion
export { UniversalFederationPlugin as default };
//# sourceMappingURL=UniversalFederationPlugin.mjs.map