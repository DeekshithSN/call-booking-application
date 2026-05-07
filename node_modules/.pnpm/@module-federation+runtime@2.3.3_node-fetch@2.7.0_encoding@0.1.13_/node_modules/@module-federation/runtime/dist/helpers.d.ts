import { getGlobalFederationInstance } from "./utils.js";
import * as _module_federation_runtime_core0 from "@module-federation/runtime-core";
import { IGlobalUtils, IGlobalUtils as IGlobalUtils$1, IShareUtils, IShareUtils as IShareUtils$1 } from "@module-federation/runtime-core";

//#region src/helpers.d.ts
type RuntimeGlobalUtils = IGlobalUtils$1 & {
  getGlobalFederationInstance: typeof getGlobalFederationInstance;
};
declare const global: RuntimeGlobalUtils;
declare const share: IShareUtils$1;
interface IRuntimeUtils {
  matchRemoteWithNameAndExpose: typeof _module_federation_runtime_core0.matchRemoteWithNameAndExpose;
  preloadAssets: (...args: any[]) => void;
  getRemoteInfo: typeof _module_federation_runtime_core0.getRemoteInfo;
}
declare const utils: IRuntimeUtils;
declare const runtimeHelpers: {
  global: RuntimeGlobalUtils;
  share: IShareUtils$1;
  utils: IRuntimeUtils;
};
//#endregion
export { type IGlobalUtils, IRuntimeUtils, type IShareUtils, runtimeHelpers as default, global, share, utils };
//# sourceMappingURL=helpers.d.ts.map