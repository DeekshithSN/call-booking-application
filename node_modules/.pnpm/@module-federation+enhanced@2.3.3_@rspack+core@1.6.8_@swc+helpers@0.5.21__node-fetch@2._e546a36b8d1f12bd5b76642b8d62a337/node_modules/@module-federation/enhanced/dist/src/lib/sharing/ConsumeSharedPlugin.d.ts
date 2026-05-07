import ConsumeSharedModule from "./ConsumeSharedModule.js";
import { ConsumeOptions, consumeSharedPlugin } from "@module-federation/sdk";
import { Compilation, Compiler } from "webpack";

//#region src/lib/sharing/ConsumeSharedPlugin.d.ts
type ConsumeSharedPluginOptions = consumeSharedPlugin.ConsumeSharedPluginOptions;
declare class ConsumeSharedPlugin {
  private _consumes;
  constructor(options: ConsumeSharedPluginOptions);
  createConsumeSharedModule(compilation: Compilation, context: string, request: string, config: ConsumeOptions): Promise<ConsumeSharedModule>;
  apply(compiler: Compiler): void;
}
//#endregion
export { ConsumeSharedPlugin as default };
//# sourceMappingURL=ConsumeSharedPlugin.d.ts.map