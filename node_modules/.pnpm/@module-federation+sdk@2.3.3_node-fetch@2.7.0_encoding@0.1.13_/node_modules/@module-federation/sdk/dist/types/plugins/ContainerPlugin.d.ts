import { EntryRuntime, Exposes, LibraryOptions } from "./ModuleFederationPlugin.js";

//#region src/types/plugins/ContainerPlugin.d.ts
declare namespace ContainerPlugin_d_exports {
  export { ContainerPluginOptions };
}
interface ContainerPluginOptions {
  exposes: Exposes;
  /**
   * The filename for this container relative path inside the `output.path` directory.
   */
  filename?: string;
  library?: LibraryOptions;
  /**
   * The name for this container.
   */
  name: string;
  runtime?: EntryRuntime;
  /**
   * The name of the share scope which is shared with the host (defaults to 'default').
   */
  shareScope?: string | string[];
  /**
   * Experimental features configuration
   */
  experiments?: {
    /** Enable async startup for the container */asyncStartup?: boolean; /** After setting true, the external MF runtime will be used and the runtime provided by the consumer will be used. (Please make sure your consumer has provideExternalRuntime: true set, otherwise it will not run properly!) */
    externalRuntime?: boolean; /** Enable providing external runtime */
    provideExternalRuntime?: boolean;
  };
  /**
   * Enable data prefetching for container modules.
   */
  dataPrefetch?: boolean;
  /**
   * Array of runtime plugins to be applied
   */
  runtimePlugins?: (string | unknown[])[];
}
//#endregion
export { ContainerPlugin_d_exports };
//# sourceMappingURL=ContainerPlugin.d.ts.map