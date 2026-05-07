import { ExternalsType, Remotes } from "./ModuleFederationPlugin.js";

//#region src/types/plugins/ContainerReferencePlugin.d.ts
declare namespace ContainerReferencePlugin_d_exports {
  export { ContainerReferencePluginOptions };
}
interface ContainerReferencePluginOptions {
  /**
   * Enable/disable asynchronous loading of runtime modules. When enabled, entry points will be wrapped in asynchronous chunks.
   */
  async?: boolean;
  /**
   * The external type of the remote containers.
   */
  remoteType: ExternalsType;
  remotes: Remotes;
  /**
   * The name of the share scope shared with all remotes (defaults to 'default').
   */
  shareScope?: string | string[];
}
//#endregion
export { ContainerReferencePlugin_d_exports };
//# sourceMappingURL=ContainerReferencePlugin.d.ts.map