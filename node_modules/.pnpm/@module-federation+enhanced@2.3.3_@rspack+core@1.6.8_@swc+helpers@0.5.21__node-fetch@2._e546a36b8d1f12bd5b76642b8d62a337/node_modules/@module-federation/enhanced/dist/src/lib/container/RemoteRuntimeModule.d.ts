import * as webpack$1 from "webpack";

//#region src/lib/container/RemoteRuntimeModule.d.ts
declare const RuntimeModule: typeof webpack$1.RuntimeModule;
declare class RemoteRuntimeModule extends RuntimeModule {
  constructor();
  /**
   * @returns {string | null} runtime code
   */
  generate(): string | null;
}
//#endregion
export { RemoteRuntimeModule as default };
//# sourceMappingURL=RemoteRuntimeModule.d.ts.map