import ContainerEntryDependency from "../ContainerEntryDependency.js";
import FederationRuntimeDependency from "./FederationRuntimeDependency.js";
import { Compilation, Compiler } from "webpack";
import { SyncHook } from "tapable";

//#region src/lib/container/runtime/FederationModulesPlugin.d.ts
/** @typedef {{ header: string[], beforeStartup: string[], startup: string[], afterStartup: string[], allowInlineStartup: boolean }} Bootstrap */
type CompilationHooks = {
  addContainerEntryDependency: SyncHook<[ContainerEntryDependency], void>;
  addFederationRuntimeDependency: SyncHook<[FederationRuntimeDependency], void>;
  addRemoteDependency: SyncHook<[any], void>;
};
declare class FederationModulesPlugin {
  options: any;
  /**
   * @param {Compilation} compilation the compilation
   * @returns {CompilationHooks} the attached hooks
   */
  static getCompilationHooks(compilation: Compilation): CompilationHooks;
  constructor(options?: {});
  apply(compiler: Compiler): void;
}
//#endregion
export { FederationModulesPlugin as default };
//# sourceMappingURL=FederationModulesPlugin.d.ts.map