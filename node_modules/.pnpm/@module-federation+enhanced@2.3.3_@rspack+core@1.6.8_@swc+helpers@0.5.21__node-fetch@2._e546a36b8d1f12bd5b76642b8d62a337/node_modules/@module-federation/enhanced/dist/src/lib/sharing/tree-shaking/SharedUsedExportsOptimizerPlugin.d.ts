import { NormalizedSharedOptions } from "../SharePlugin.js";
import { ReferencedExports } from "./SharedUsedExportsOptimizerRuntimeModule.js";
import { moduleFederationPlugin } from "@module-federation/sdk";
import { Compiler, WebpackPluginInstance } from "webpack";

//#region src/lib/sharing/tree-shaking/SharedUsedExportsOptimizerPlugin.d.ts
type CustomReferencedExports = {
  [sharedName: string]: string[];
};
declare class SharedUsedExportsOptimizerPlugin implements WebpackPluginInstance {
  name: string;
  sharedReferencedExports: ReferencedExports;
  private sharedOptions;
  private injectTreeShakingUsedExports;
  private manifestOptions;
  ignoredRuntime: string[];
  constructor(sharedOptions: NormalizedSharedOptions, injectTreeShakingUsedExports?: boolean, ignoredRuntime?: string[], manifestOptions?: moduleFederationPlugin.ModuleFederationPluginOptions['manifest']);
  private applyCustomReferencedExports;
  apply(compiler: Compiler): void;
}
//#endregion
export { CustomReferencedExports, SharedUsedExportsOptimizerPlugin as default };
//# sourceMappingURL=SharedUsedExportsOptimizerPlugin.d.ts.map