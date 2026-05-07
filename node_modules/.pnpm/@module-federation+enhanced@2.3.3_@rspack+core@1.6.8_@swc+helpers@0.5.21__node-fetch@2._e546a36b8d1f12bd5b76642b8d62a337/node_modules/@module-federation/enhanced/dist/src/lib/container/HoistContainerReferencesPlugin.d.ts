import { Compilation, Compiler, Module, WebpackPluginInstance } from "webpack";

//#region src/lib/container/HoistContainerReferencesPlugin.d.ts
/**
 * This plugin hoists container-related modules into runtime chunks when using runtimeChunk: single configuration.
 */
declare class HoistContainerReferences implements WebpackPluginInstance {
  apply(compiler: Compiler): void;
  private hoistModulesInChunks;
  private cleanUpChunks;
  private getRuntimeChunks;
}
declare function getAllReferencedModules(compilation: Compilation, module: Module, type?: 'all' | 'initial' | 'external'): Set<Module>;
//#endregion
export { HoistContainerReferences as default, getAllReferencedModules };
//# sourceMappingURL=HoistContainerReferencesPlugin.d.ts.map