import { InitScope, RemoteEntryExports, RemoteInfo } from "../type/config.js";
import { ModuleFederation } from "../core.js";
import { ModuleInfo } from "@module-federation/sdk";

//#region ../runtime-core/dist/module/index.d.ts
//#region src/module/index.d.ts
type ModuleOptions = ConstructorParameters<typeof Module$1>[0];
declare class Module$1 {
  remoteInfo: RemoteInfo;
  inited: boolean;
  initing: boolean;
  initPromise?: Promise<void>;
  remoteEntryExports?: RemoteEntryExports;
  lib: RemoteEntryExports | undefined;
  host: ModuleFederation;
  constructor({
    remoteInfo,
    host
  }: {
    remoteInfo: RemoteInfo;
    host: ModuleFederation;
  });
  getEntry(): Promise<RemoteEntryExports>;
  init(id?: string, remoteSnapshot?: ModuleInfo, rawInitScope?: InitScope): Promise<RemoteEntryExports>;
  get(id: string, expose: string, options?: {
    loadFactory?: boolean;
  }, remoteSnapshot?: ModuleInfo): Promise<any>;
  private wraperFactory;
} //#endregion
//#endregion
export { Module$1, ModuleOptions };
//# sourceMappingURL=index.d.ts.map