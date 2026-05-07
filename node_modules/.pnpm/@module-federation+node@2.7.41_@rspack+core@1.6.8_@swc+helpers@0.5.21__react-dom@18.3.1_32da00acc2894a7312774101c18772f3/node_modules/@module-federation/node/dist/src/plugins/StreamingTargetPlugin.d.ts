import { ModuleFederationPluginOptions } from "../types/index.js";
import { Compiler, WebpackPluginInstance } from "webpack";

//#region src/plugins/StreamingTargetPlugin.d.ts
/**
 * Interface for StreamingTargetOptions which extends ModuleFederationPluginOptions
 * @property {string} promiseBaseURI - The base URI for the promise
 * @property {boolean} debug - Flag to enable/disable debug mode
 */
interface StreamingTargetOptions extends ModuleFederationPluginOptions {
  promiseBaseURI?: string;
  debug?: boolean;
}
/**
 * Class representing a StreamingTargetPlugin
 */
declare class StreamingTargetPlugin implements WebpackPluginInstance {
  private options;
  /**
   * Create a StreamingTargetPlugin
   * @param {StreamingTargetOptions} options - The options for the plugin
   */
  constructor(options: StreamingTargetOptions);
  /**
   * Apply the plugin to the compiler
   * @param {Compiler} compiler - The webpack compiler
   */
  apply(compiler: Compiler): void;
}
export = StreamingTargetPlugin;
//# sourceMappingURL=StreamingTargetPlugin.d.ts.map