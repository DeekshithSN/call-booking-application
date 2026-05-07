import * as webpack$1 from "webpack";

//#region src/lib/sharing/ProvideForSharedDependency.d.ts
declare const dependencies: typeof webpack$1.dependencies;
declare class ProvideForSharedDependency extends dependencies.ModuleDependency {
  /**
   *
   * @param request request string
   */
  constructor(request: string);
  get type(): string;
  get category(): string;
}
//#endregion
export { ProvideForSharedDependency as default };
//# sourceMappingURL=ProvideForSharedDependency.d.ts.map