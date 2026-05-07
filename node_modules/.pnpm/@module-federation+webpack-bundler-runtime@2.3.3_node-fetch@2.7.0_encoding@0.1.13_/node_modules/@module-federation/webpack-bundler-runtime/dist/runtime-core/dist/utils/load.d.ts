import { RemoteEntryExports, RemoteInfo } from "../type/config.js";
import { ModuleFederation } from "../core.js";

//#region ../runtime-core/dist/utils/load.d.ts
//#region src/utils/load.d.ts
declare function getRemoteEntry(params: {
  origin: ModuleFederation;
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
  getEntryUrl?: (url: string) => string;
  _inErrorHandling?: boolean;
}): Promise<RemoteEntryExports | false | void>;
//#endregion
export { getRemoteEntry };
//# sourceMappingURL=load.d.ts.map