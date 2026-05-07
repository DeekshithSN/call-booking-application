import { Chunk, Compiler, Module } from "webpack";

//#region src/plugins/EntryChunkTrackerPlugin.d.ts
interface Options {
  eager?: RegExp | ((module: Module) => boolean);
  excludeChunk?: (chunk: Chunk) => boolean;
}
declare class EntryChunkTrackerPlugin {
  private _options;
  constructor(options?: Options);
  apply(compiler: Compiler): void;
  private _handleRenderStartup;
  private _getTemplateString;
}
//#endregion
export { Options, EntryChunkTrackerPlugin as default };
//# sourceMappingURL=EntryChunkTrackerPlugin.d.ts.map