import BaseWrapperPlugin from "./BaseWrapperPlugin.js";
import { moduleFederationPlugin } from "@module-federation/sdk";

//#region src/wrapper/FederationRuntimePlugin.d.ts
declare class FederationRuntimePlugin extends BaseWrapperPlugin {
  entryFilePath: string;
  constructor(options?: moduleFederationPlugin.ModuleFederationPluginOptions);
  protected createCorePluginInstance(CorePlugin: any, compiler: any): void;
}
//#endregion
export { FederationRuntimePlugin as default };
//# sourceMappingURL=FederationRuntimePlugin.d.ts.map