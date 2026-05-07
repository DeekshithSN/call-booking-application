import BaseWrapperPlugin from "./BaseWrapperPlugin.js";
import { TreeShakingSharePluginOptions } from "../lib/sharing/tree-shaking/TreeShakingSharedPlugin.js";

//#region src/wrapper/TreeShakingSharedPlugin.d.ts
declare class TreeShakingSharedPlugin extends BaseWrapperPlugin {
  constructor(options: TreeShakingSharePluginOptions);
}
//#endregion
export { TreeShakingSharedPlugin as default };
//# sourceMappingURL=TreeShakingSharedPlugin.d.ts.map