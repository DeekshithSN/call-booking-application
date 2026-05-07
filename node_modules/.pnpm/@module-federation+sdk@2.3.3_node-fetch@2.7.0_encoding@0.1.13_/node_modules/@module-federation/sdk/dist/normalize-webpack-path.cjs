Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
let node_path = require("node:path");

//#region src/normalize-webpack-path.ts
function getWebpackPath(compiler, options = { framework: "other" }) {
	const resolveWithContext = new Function("id", "options", "return typeof require === \"undefined\" ? \"\" : require.resolve(id, options)");
	try {
		compiler.webpack();
		return "";
	} catch (err) {
		const webpackPath = ((err.stack?.split("\n") || []).find((item) => item.includes("at webpack")) || "").replace(/[^\(\)]+/, "").slice(1, -1).split(":").slice(0, -2).join(":");
		if (options?.framework === "nextjs") {
			if (webpackPath.endsWith("webpack.js")) return webpackPath.replace("webpack.js", "index.js");
			return "";
		}
		return resolveWithContext("webpack", { paths: [webpackPath] });
	}
}
const normalizeWebpackPath = (fullPath) => {
	if (fullPath === "webpack") return process.env["FEDERATION_WEBPACK_PATH"] || fullPath;
	if (process.env["FEDERATION_WEBPACK_PATH"]) return (0, node_path.resolve)(process.env["FEDERATION_WEBPACK_PATH"], fullPath.replace("webpack", "../../"));
	return fullPath;
};

//#endregion
exports.getWebpackPath = getWebpackPath;
exports.normalizeWebpackPath = normalizeWebpackPath;
//# sourceMappingURL=normalize-webpack-path.cjs.map