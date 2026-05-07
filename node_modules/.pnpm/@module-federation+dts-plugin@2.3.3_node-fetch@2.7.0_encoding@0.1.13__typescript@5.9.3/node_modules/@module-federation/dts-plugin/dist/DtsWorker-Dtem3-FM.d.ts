import { moduleFederationPlugin } from "@module-federation/sdk";
import ts from "typescript";
import { ChildProcess } from "child_process";

//#region \0rolldown/runtime.js
//#endregion
//#region src/core/interfaces/RemoteOptions.d.ts
interface RemoteOptions extends moduleFederationPlugin.DtsRemoteOptions {
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  context?: string;
  implementation?: string;
  hostRemoteTypesFolder?: string;
  outputDir?: string;
}
//#endregion
//#region src/core/interfaces/TsConfigJson.d.ts
interface TsConfigJson {
  extends?: string;
  compilerOptions?: ts.CompilerOptions;
  exclude?: string[];
  include?: string[];
  files?: string[];
}
//#endregion
//#region src/core/configurations/remotePlugin.d.ts
declare const retrieveRemoteConfig: (options: RemoteOptions) => {
  tsConfig: TsConfigJson;
  mapComponentsToExpose: Record<string, string>;
  remoteOptions: Required<RemoteOptions>;
};
//#endregion
//#region src/core/interfaces/HostOptions.d.ts
interface HostOptions extends moduleFederationPlugin.DtsHostOptions {
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  context?: string;
  implementation?: string;
  runtimePkgs?: string[];
}
interface RemoteInfo {
  name: string;
  url: string;
  alias: string;
  zipUrl?: string;
  apiTypeUrl?: string;
}
//#endregion
//#region src/core/interfaces/DTSManagerOptions.d.ts
interface DTSManagerOptions {
  remote?: RemoteOptions;
  host?: HostOptions;
  extraOptions?: Record<string, any>;
  displayErrorInTerminal?: moduleFederationPlugin.PluginDtsOptions['displayErrorInTerminal'];
}
//#endregion
//#region src/server/constant.d.ts
declare const enum UpdateMode {
  POSITIVE = "POSITIVE",
  PASSIVE = "PASSIVE"
}
//#endregion
//#region src/core/lib/DTSManager.d.ts
interface UpdateTypesOptions {
  updateMode: UpdateMode;
  remoteName?: string;
  remoteTarPath?: string;
  remoteInfo?: RemoteInfo;
  once?: boolean;
}
declare class DTSManager {
  options: DTSManagerOptions;
  runtimePkgs: string[];
  remoteAliasMap: Record<string, Required<RemoteInfo>>;
  loadedRemoteAPIAlias: Set<string>;
  extraOptions: Record<string, any>;
  updatedRemoteInfos: Record<string, Required<RemoteInfo>>;
  constructor(options: DTSManagerOptions);
  generateAPITypes(mapComponentsToExpose: Record<string, string>): string;
  extractRemoteTypes(options: ReturnType<typeof retrieveRemoteConfig>): Promise<void>;
  generateTypes(): Promise<void>;
  requestRemoteManifest(remoteInfo: RemoteInfo, hostOptions: Required<HostOptions>): Promise<Required<RemoteInfo>>;
  consumeTargetRemotes(hostOptions: Required<HostOptions>, remoteInfo: Required<RemoteInfo>): Promise<[string, string]>;
  downloadAPITypes(remoteInfo: Required<RemoteInfo>, destinationPath: string, hostOptions: Required<HostOptions>): Promise<boolean>;
  consumeAPITypes(hostOptions: Required<HostOptions>): void;
  consumeArchiveTypes(options: HostOptions): Promise<{
    hostOptions: Required<HostOptions>;
    downloadPromisesResult: PromiseSettledResult<[string, string]>[];
  }>;
  consumeTypes(): Promise<void>;
  updateTypes(options: UpdateTypesOptions): Promise<void>;
}
//#endregion
//#region src/core/rpc/expose-rpc.d.ts
declare function exposeRpc(fn: (...args: any[]) => any): void;
//#endregion
//#region src/core/rpc/types.d.ts
declare enum RpcGMCallTypes {
  CALL = "mf_call",
  RESOLVE = "mf_resolve",
  REJECT = "mf_reject",
  EXIT = "mf_exit"
}
interface RpcCallMessage {
  type: RpcGMCallTypes.CALL;
  id: string;
  args: unknown[];
}
interface RpcResolveMessage {
  type: RpcGMCallTypes.RESOLVE;
  id: string;
  value: unknown;
}
interface RpcRejectMessage {
  type: RpcGMCallTypes.REJECT;
  id: string;
  error: unknown;
}
interface RpcExitMessage {
  type: RpcGMCallTypes.EXIT;
  id: string;
}
type RpcMessage = RpcCallMessage | RpcResolveMessage | RpcRejectMessage | RpcExitMessage;
type RpcMethod = (...args: any[]) => any;
type RpcRemoteMethod<T extends RpcMethod> = T extends ((...args: infer A) => infer R) ? R extends Promise<any> ? (...args: A) => R : (...args: A) => Promise<R> : (...args: unknown[]) => Promise<unknown>;
//#endregion
//#region src/core/rpc/wrap-rpc.d.ts
interface WrapRpcOptions {
  id: string;
  once?: boolean;
}
declare function wrapRpc<T extends (...args: any[]) => any>(childProcess: ChildProcess, options: WrapRpcOptions): RpcRemoteMethod<T>;
//#endregion
//#region src/core/rpc/rpc-worker.d.ts
interface RpcWorkerBase {
  connect(...args: unknown[]): any;
  terminate(): void;
  readonly connected: boolean;
  readonly id: string;
  readonly process: ChildProcess | undefined;
}
type RpcWorker<T extends RpcMethod = RpcMethod> = RpcWorkerBase & RpcRemoteMethod<T>;
declare function createRpcWorker<T extends RpcMethod>(modulePath: string, data: unknown, memoryLimit?: number, once?: boolean): RpcWorker<T>;
declare function getRpcWorkerData(): unknown;
//#endregion
//#region src/core/rpc/rpc-error.d.ts
declare class RpcExitError extends Error {
  readonly code?: string | number | null;
  readonly signal?: string | null;
  constructor(message: string, code?: string | number | null, signal?: string | null);
}
declare namespace index_d_exports {
  export { RpcCallMessage, RpcExitError, RpcGMCallTypes, RpcMessage, RpcMethod, RpcRejectMessage, RpcRemoteMethod, RpcResolveMessage, RpcWorker, createRpcWorker, exposeRpc, getRpcWorkerData, wrapRpc };
}
//#endregion
//#region src/core/lib/DtsWorker.d.ts
type DtsWorkerOptions = DTSManagerOptions;
declare class DtsWorker {
  rpcWorker: RpcWorker<RpcMethod>;
  private _options;
  private _res;
  constructor(options: DtsWorkerOptions);
  removeUnSerializationOptions(): void;
  get controlledPromise(): ReturnType<DTSManager['generateTypes']>;
  exit(): void;
}
//#endregion
export { DTSManagerOptions as a, retrieveRemoteConfig as c, DTSManager as i, TsConfigJson as l, DtsWorkerOptions as n, HostOptions as o, index_d_exports as r, RemoteInfo as s, DtsWorker as t, RemoteOptions as u };