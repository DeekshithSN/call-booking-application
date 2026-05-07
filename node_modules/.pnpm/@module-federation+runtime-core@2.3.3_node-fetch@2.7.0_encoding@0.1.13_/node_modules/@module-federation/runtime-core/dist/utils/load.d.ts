import { ModuleFederation } from "../core.js";
import { Remote, RemoteEntryExports, RemoteInfo } from "../type/config.js";
//#region src/utils/load.d.ts
declare function getRemoteEntry(params: {
  origin: ModuleFederation;
  remoteInfo: RemoteInfo;
  remoteEntryExports?: RemoteEntryExports | undefined;
  getEntryUrl?: (url: string) => string;
  _inErrorHandling?: boolean;
}): Promise<RemoteEntryExports | false | void>;
declare function getRemoteInfo(remote: Remote): RemoteInfo;
//#endregion
export { getRemoteEntry, getRemoteInfo };
//# sourceMappingURL=load.d.ts.map