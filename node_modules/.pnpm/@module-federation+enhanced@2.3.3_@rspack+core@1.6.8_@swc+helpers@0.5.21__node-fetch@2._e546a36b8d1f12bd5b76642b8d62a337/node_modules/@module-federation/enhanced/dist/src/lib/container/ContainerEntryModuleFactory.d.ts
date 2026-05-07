import * as webpack_lib_ModuleFactory0 from "webpack/lib/ModuleFactory";
import { ModuleFactoryCreateData, ModuleFactoryResult } from "webpack/lib/ModuleFactory";

//#region src/lib/container/ContainerEntryModuleFactory.d.ts
declare const ModuleFactory: typeof webpack_lib_ModuleFactory0;
declare class ContainerEntryModuleFactory extends ModuleFactory {
  /**
   * @param {ModuleFactoryCreateData} data data object
   * @param {function((Error | null)=, ModuleFactoryResult=): void} callback callback
   * @returns {void}
   */
  create(data: ModuleFactoryCreateData, callback: (error: Error | null, result: ModuleFactoryResult) => void): void;
}
//#endregion
export { ContainerEntryModuleFactory as default };
//# sourceMappingURL=ContainerEntryModuleFactory.d.ts.map