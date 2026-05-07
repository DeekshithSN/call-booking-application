Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });
const require_runtime = require('../../_virtual/_rolldown/runtime.js');
const require_lib_container_runtime_FederationModulesPlugin = require('./runtime/FederationModulesPlugin.js');
let _module_federation_sdk_normalize_webpack_path = require("@module-federation/sdk/normalize-webpack-path");

//#region src/lib/container/HoistContainerReferencesPlugin.ts
const { AsyncDependenciesBlock, ExternalModule } = require((0, _module_federation_sdk_normalize_webpack_path.normalizeWebpackPath)("webpack"));
const PLUGIN_NAME = "HoistContainerReferences";
/**
* This plugin hoists container-related modules into runtime chunks when using runtimeChunk: single configuration.
*/
var HoistContainerReferences = class {
	apply(compiler) {
		compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
			const logger = compilation.getLogger(PLUGIN_NAME);
			const hooks = require_lib_container_runtime_FederationModulesPlugin.default.getCompilationHooks(compilation);
			const containerEntryDependencies = /* @__PURE__ */ new Set();
			const federationRuntimeDependencies = /* @__PURE__ */ new Set();
			const remoteDependencies = /* @__PURE__ */ new Set();
			hooks.addContainerEntryDependency.tap("HoistContainerReferences", (dep) => {
				containerEntryDependencies.add(dep);
			});
			hooks.addFederationRuntimeDependency.tap("HoistContainerReferences", (dep) => {
				federationRuntimeDependencies.add(dep);
			});
			hooks.addRemoteDependency.tap("HoistContainerReferences", (dep) => {
				remoteDependencies.add(dep);
			});
			compilation.hooks.optimizeChunks.tap({
				name: PLUGIN_NAME,
				stage: 11
			}, (chunks) => {
				const runtimeChunks = this.getRuntimeChunks(compilation);
				this.hoistModulesInChunks(compilation, runtimeChunks, logger, containerEntryDependencies, federationRuntimeDependencies, remoteDependencies);
			});
		});
	}
	hoistModulesInChunks(compilation, runtimeChunks, logger, containerEntryDependencies, federationRuntimeDependencies, remoteDependencies) {
		const { chunkGraph, moduleGraph } = compilation;
		const allModulesToHoist = /* @__PURE__ */ new Set();
		for (const dep of containerEntryDependencies) {
			const containerEntryModule = moduleGraph.getModule(dep);
			if (!containerEntryModule) continue;
			const referencedModules = getAllReferencedModules(compilation, containerEntryModule, "initial");
			referencedModules.forEach((m) => allModulesToHoist.add(m));
			const moduleRuntimes = chunkGraph.getModuleRuntimes(containerEntryModule);
			const runtimes = /* @__PURE__ */ new Set();
			for (const runtimeSpec of moduleRuntimes) compilation.compiler.webpack.util.runtime.forEachRuntime(runtimeSpec, (runtimeKey) => {
				if (runtimeKey) runtimes.add(runtimeKey);
			});
			for (const runtime of runtimes) {
				const runtimeChunk = compilation.namedChunks.get(runtime);
				if (!runtimeChunk) continue;
				for (const module of referencedModules) if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) chunkGraph.connectChunkAndModule(runtimeChunk, module);
			}
		}
		for (const dep of federationRuntimeDependencies) {
			const runtimeModule = moduleGraph.getModule(dep);
			if (!runtimeModule) continue;
			const referencedModules = getAllReferencedModules(compilation, runtimeModule, "initial");
			referencedModules.forEach((m) => allModulesToHoist.add(m));
			const moduleRuntimes = chunkGraph.getModuleRuntimes(runtimeModule);
			const runtimes = /* @__PURE__ */ new Set();
			for (const runtimeSpec of moduleRuntimes) compilation.compiler.webpack.util.runtime.forEachRuntime(runtimeSpec, (runtimeKey) => {
				if (runtimeKey) runtimes.add(runtimeKey);
			});
			for (const runtime of runtimes) {
				const runtimeChunk = compilation.namedChunks.get(runtime);
				if (!runtimeChunk) continue;
				for (const module of referencedModules) if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) chunkGraph.connectChunkAndModule(runtimeChunk, module);
			}
		}
		for (const remoteDep of remoteDependencies) {
			const remoteModule = moduleGraph.getModule(remoteDep);
			if (!remoteModule) continue;
			const referencedRemoteModules = getAllReferencedModules(compilation, remoteModule, "initial");
			referencedRemoteModules.forEach((m) => allModulesToHoist.add(m));
			const remoteModuleRuntimes = chunkGraph.getModuleRuntimes(remoteModule);
			const remoteRuntimes = /* @__PURE__ */ new Set();
			for (const runtimeSpec of remoteModuleRuntimes) compilation.compiler.webpack.util.runtime.forEachRuntime(runtimeSpec, (runtimeKey) => {
				if (runtimeKey) remoteRuntimes.add(runtimeKey);
			});
			for (const runtime of remoteRuntimes) {
				const runtimeChunk = compilation.namedChunks.get(runtime);
				if (!runtimeChunk) continue;
				for (const module of referencedRemoteModules) if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) chunkGraph.connectChunkAndModule(runtimeChunk, module);
			}
		}
		this.cleanUpChunks(compilation, allModulesToHoist);
	}
	cleanUpChunks(compilation, modules) {
		const { chunkGraph } = compilation;
		for (const module of modules) for (const chunk of chunkGraph.getModuleChunks(module)) if (!chunk.hasRuntime()) chunkGraph.disconnectChunkAndModule(chunk, module);
	}
	getRuntimeChunks(compilation) {
		const runtimeChunks = /* @__PURE__ */ new Set();
		for (const chunk of compilation.chunks) if (chunk.hasRuntime()) runtimeChunks.add(chunk);
		return runtimeChunks;
	}
};
function getAllReferencedModules(compilation, module, type) {
	const collectedModules = new Set([module]);
	const visitedModules = new WeakSet([module]);
	const stack = [module];
	while (stack.length > 0) {
		const currentModule = stack.pop();
		if (!currentModule) continue;
		const mgm = compilation.moduleGraph._getModuleGraphModule(currentModule);
		if (!mgm?.outgoingConnections) continue;
		for (const connection of mgm.outgoingConnections) {
			const connectedModule = connection.module;
			if (!connectedModule || visitedModules.has(connectedModule)) continue;
			if (type === "initial") {
				if (compilation.moduleGraph.getParentBlock(connection.dependency) instanceof AsyncDependenciesBlock) continue;
			}
			if (type === "external") {
				if (connection.module instanceof ExternalModule) collectedModules.add(connectedModule);
			} else collectedModules.add(connectedModule);
			visitedModules.add(connectedModule);
			stack.push(connectedModule);
		}
	}
	return collectedModules;
}

//#endregion
exports.default = HoistContainerReferences;
exports.getAllReferencedModules = getAllReferencedModules;
//# sourceMappingURL=HoistContainerReferencesPlugin.js.map