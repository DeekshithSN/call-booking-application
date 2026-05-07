import * as webpack$1 from "webpack";

//#region src/lib/sharing/ShareRuntimeModule.d.ts
declare const RuntimeModule: typeof webpack$1.RuntimeModule;
declare class ShareRuntimeModule extends RuntimeModule {
  constructor();
  /**
   * @returns {string | null} runtime code
   */
  generate(): string | null;
}
//#endregion
export { ShareRuntimeModule as default };
//# sourceMappingURL=ShareRuntimeModule.d.ts.map