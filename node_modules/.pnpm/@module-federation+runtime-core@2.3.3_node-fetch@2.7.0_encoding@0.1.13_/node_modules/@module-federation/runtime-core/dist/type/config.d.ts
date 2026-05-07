import { ModuleFederationRuntimePlugin } from "./plugin.js";
import { Module, RemoteEntryType, RemoteWithEntry, RemoteWithVersion, TreeShakingStatus } from "@module-federation/sdk";

//#region src/type/config.d.ts
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
type PartialOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] };
interface RemoteInfoCommon {
  alias?: string;
  shareScope?: string | string[];
  type?: RemoteEntryType;
  entryGlobalName?: string;
}
type RemoteInfoOptionalVersion = {
  name: string;
  version?: string;
} & RemoteInfoCommon;
type Remote = (RemoteWithEntry | RemoteWithVersion) & RemoteInfoCommon;
type LoadShareExtraOptions = {
  customShareInfo?: Partial<Shared>;
  resolver?: (sharedOptions: ShareInfos[string]) => Shared;
};
interface RemoteInfo {
  alias?: string;
  name: string;
  version?: string;
  buildVersion?: string;
  entry: string;
  type: RemoteEntryType;
  entryGlobalName: string;
  shareScope: string | string[];
}
type HostInfo = Pick<Options, 'name' | 'version' | 'remotes' | 'version'>;
interface SharedConfig {
  singleton?: boolean;
  requiredVersion: false | string;
  eager?: boolean;
  strictVersion?: boolean;
  layer?: string | null;
}
type TreeShakingArgs = {
  usedExports?: string[];
  get?: SharedGetter;
  lib?: () => Module;
  status?: TreeShakingStatus;
  mode?: 'server-calc' | 'runtime-infer';
  loading?: null | Promise<any>;
  loaded?: boolean;
  useIn?: Array<string>;
};
type SharedBaseArgs = {
  version?: string;
  shareConfig?: SharedConfig;
  scope?: string | Array<string>;
  deps?: Array<string>;
  strategy?: 'version-first' | 'loaded-first';
  loaded?: boolean;
  treeShaking?: TreeShakingArgs;
};
type SharedGetter = (() => () => Module) | (() => Promise<() => Module>);
type ShareArgs = (SharedBaseArgs & {
  get: SharedGetter;
}) | (SharedBaseArgs & {
  lib: () => Module;
}) | SharedBaseArgs;
type ShareStrategy = 'version-first' | 'loaded-first';
type NoMatchedUsedExportsItem = [from: string, usedExports?: string[]];
type Shared = {
  version: string;
  get: SharedGetter;
  shareConfig: SharedConfig;
  scope: Array<string>;
  useIn: Array<string>;
  from: string;
  deps: Array<string>;
  lib?: () => Module;
  loaded?: boolean;
  loading?: null | Promise<any>;
  eager?: boolean;
  /**
   * @deprecated set in initOptions.shareStrategy instead
   */
  strategy: ShareStrategy;
  treeShaking?: TreeShakingArgs;
};
type ShareScopeMap = {
  [scope: string]: {
    [pkgName: string]: {
      [sharedVersion: string]: Shared;
    };
  };
};
type GlobalShareScopeMap = {
  [instanceName: string]: ShareScopeMap;
};
type ShareInfos = {
  [pkgName: string]: Shared[];
};
interface Options {
  id?: string;
  name: string;
  version?: string;
  remotes: Array<Remote>;
  shared: ShareInfos;
  plugins: Array<ModuleFederationRuntimePlugin>;
  inBrowser: boolean;
  shareStrategy?: ShareStrategy;
}
type UserOptions = Omit<Optional<Options, 'plugins'>, 'shared' | 'inBrowser'> & {
  shared?: {
    [pkgName: string]: ShareArgs | ShareArgs[];
  };
};
type LoadModuleOptions = {
  version?: string;
};
type RemoteEntryInitOptions = {
  version: string;
  shareScopeMap?: ShareScopeMap;
  shareScopeKeys: string | string[];
};
type InitTokens = Record<string, Record<string, any>>;
type InitScope = InitTokens[];
type CallFrom = 'build' | 'runtime';
type RemoteEntryExports = {
  get: (id: string) => () => Promise<Module>;
  init: (shareScope: ShareScopeMap[string], initScope?: InitScope, remoteEntryInitOPtions?: RemoteEntryInitOptions) => void | Promise<void>;
};
//#endregion
export { CallFrom, GlobalShareScopeMap, HostInfo, InitScope, InitTokens, LoadModuleOptions, LoadShareExtraOptions, NoMatchedUsedExportsItem, Optional, Options, PartialOptional, Remote, RemoteEntryExports, RemoteEntryInitOptions, RemoteInfo, RemoteInfoCommon, RemoteInfoOptionalVersion, ShareArgs, ShareInfos, ShareScopeMap, ShareStrategy, Shared, SharedConfig, SharedGetter, TreeShakingArgs, UserOptions };
//# sourceMappingURL=config.d.ts.map