import { Shared } from "./ModuleFederationPlugin.js";

//#region src/types/plugins/SharePlugin.d.ts
declare namespace SharePlugin_d_exports {
  export { SharePluginOptions };
}
interface SharePluginOptions {
  /**
   * Enable/disable asynchronous loading of runtime modules. When enabled, entry points will be wrapped in asynchronous chunks.
   */
  async?: boolean;
  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string | string[];
  shared: Shared;
  /**
   * Experimental features configuration
   */
  experiments?: {
    /** Enable reconstructed lookup for node_modules paths */allowNodeModulesSuffixMatch?: boolean;
  };
}
//#endregion
export { SharePlugin_d_exports };
//# sourceMappingURL=SharePlugin.d.ts.map