import { IncludeExcludeOptions } from "./ConsumeSharedPlugin.js";

//#region src/types/plugins/ProvideSharedPlugin.d.ts
declare namespace ProvideSharedPlugin_d_exports {
  export { ProvideSharedPluginOptions, Provides, ProvidesConfig, ProvidesItem, ProvidesObject };
}
/**
 * Request to a module that should be provided as shared module to the share scope (will be resolved when relative).
 */
type ProvidesItem = string;
/**
 * Advanced configuration for modules that should be provided as shared modules to the share scope.
 */
interface ProvidesConfig {
  /**
   * Include the provided module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
   */
  eager?: boolean;
  /**
   * Key in the share scope under which the shared modules should be stored.
   */
  shareKey?: string;
  /**
   * Import request to match on
   */
  request?: string;
  /**
   * Share scope name.
   */
  shareScope?: string | string[];
  /**
   * Version requirement from module in share scope.
   */
  requiredVersion?: false | string;
  /**
   * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
   */
  strictVersion?: boolean;
  /**
   * Allow only a single version of the shared module in share scope (disabled by default).
   */
  singleton?: boolean;
  /**
   * Layer in which the shared module should be placed.
   */
  layer?: string;
  /**
   * Layer of the issuer.
   */
  issuerLayer?: string;
  /**
   * Version of the provided module. Will replace lower matching versions, but not higher.
   */
  version?: false | string;
  /**
   * Filter for the shared module.
   */
  exclude?: IncludeExcludeOptions;
  /**
   * Options for including only certain versions or requests of the provided module. Cannot be used with 'exclude'.
   */
  include?: IncludeExcludeOptions;
  /**
   * Enable reconstructed lookup for node_modules paths for this share item
   */
  allowNodeModulesSuffixMatch?: boolean;
  /**
   * Tree shaking mode for the shared module.
   */
  treeShakingMode?: 'server-calc' | 'runtime-infer';
}
/**
 * Modules that should be provided as shared modules to the share scope. Property names are used as share keys.
 */
interface ProvidesObject {
  [k: string]: ProvidesConfig | ProvidesItem;
}
/**
 * Modules that should be provided as shared modules to the share scope. When provided, property name is used to match modules, otherwise this is automatically inferred from share key.
 */
type Provides = (ProvidesItem | ProvidesObject)[] | ProvidesObject;
interface ProvideSharedPluginOptions {
  provides: Provides;
  /**
   * Share scope name used for all provided modules (defaults to 'default').
   */
  shareScope?: string | string[];
  /**
   * Experimental features configuration
   */
  experiments?: {
    /** Enable reconstructed lookup for node_modules paths */allowNodeModulesSuffixMatch?: boolean;
  };
}
//#endregion
export { ProvideSharedPlugin_d_exports };
//# sourceMappingURL=ProvideSharedPlugin.d.ts.map