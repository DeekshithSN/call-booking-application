import { ModuleFederation } from "../core.js";
import { RemoteInfo } from "../type/config.js";
import { PreloadAssets } from "../type/preload.js";
//#region src/utils/preload.d.ts
declare function preloadAssets(remoteInfo: RemoteInfo, host: ModuleFederation, assets: PreloadAssets, useLinkPreload?: boolean): void;
//#endregion
export { preloadAssets };
//# sourceMappingURL=preload.d.ts.map