import * as webpack$1 from "webpack";
import { Compilation } from "webpack";
import { CodeGenerationContext, CodeGenerationResult, LibIdentOptions, NeedBuildContext, ObjectDeserializerContext, ObjectSerializerContext, RequestShortener, ResolverWithOptions } from "webpack/lib/Module";
import WebpackError$1 from "webpack/lib/WebpackError";
import { InputFileSystem as InputFileSystem$1 } from "webpack/lib/util/fs";
import { WebpackOptionsNormalized as WebpackOptionsNormalized$1 } from "webpack/declarations/WebpackOptions";

//#region src/lib/sharing/ProvideSharedModule.d.ts
declare const Module$1: typeof webpack$1.Module;
/**
 * @class
 * @extends {Module}
 */
declare class ProvideSharedModule extends Module$1 {
  private _shareScope;
  private _name;
  private _version;
  private _request;
  private _eager;
  private _requiredVersion;
  private _strictVersion;
  private _singleton;
  private _treeShakingMode?;
  /**
   * @constructor
   * @param {string|string[]} shareScope shared scope name
   * @param {string} name shared key
   * @param {string | false} version version
   * @param {string} request request to the provided module
   * @param {boolean} eager include the module in sync way
   * @param {boolean} requiredVersion version requirement
   * @param {boolean} strictVersion don't use shared version even if version isn't valid
   * @param {boolean} singleton use single global version
   * @param {string} [layer] layer information
   */
  constructor(shareScope: string | string[], name: string, version: string | false, request: string, eager: boolean, requiredVersion: string | false, strictVersion: boolean, singleton: boolean, layer?: string, treeShakingMode?: 'server-calc' | 'runtime-infer');
  /**
   * @returns {string} a unique identifier of the module
   */
  identifier(): string;
  /**
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  readableIdentifier(requestShortener: RequestShortener): string;
  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  libIdent(options: LibIdentOptions): string | null;
  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  needBuild(context: NeedBuildContext, callback: (error?: WebpackError$1 | null, needsRebuild?: boolean) => void): void;
  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {function(WebpackError=): void} callback callback function
   * @returns {void}
   */
  build(options: WebpackOptionsNormalized$1, compilation: Compilation, resolver: ResolverWithOptions, fs: InputFileSystem$1, callback: (error?: WebpackError$1) => void): void;
  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  size(type?: string): number;
  /**
   * @returns {Set<string>} types available (do not mutate)
   */
  getSourceTypes(): Set<string>;
  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  codeGeneration({
    runtimeTemplate,
    moduleGraph,
    chunkGraph
  }: CodeGenerationContext): CodeGenerationResult;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize(context: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ProvideSharedModule} deserialize fallback dependency
   */
  static deserialize(context: ObjectDeserializerContext): ProvideSharedModule;
}
//#endregion
export { ProvideSharedModule as default };
//# sourceMappingURL=ProvideSharedModule.d.ts.map