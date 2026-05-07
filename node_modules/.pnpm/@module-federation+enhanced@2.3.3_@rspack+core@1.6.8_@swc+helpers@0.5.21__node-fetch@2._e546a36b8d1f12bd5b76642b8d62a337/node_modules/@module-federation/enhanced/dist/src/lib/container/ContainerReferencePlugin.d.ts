import { containerReferencePlugin } from "@module-federation/sdk";
import { Compiler } from "webpack";

//#region src/lib/container/ContainerReferencePlugin.d.ts
declare class ContainerReferencePlugin {
  private _remoteType;
  private _remotes;
  constructor(options: containerReferencePlugin.ContainerReferencePluginOptions);
  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void;
}
//#endregion
export { ContainerReferencePlugin as default };
//# sourceMappingURL=ContainerReferencePlugin.d.ts.map