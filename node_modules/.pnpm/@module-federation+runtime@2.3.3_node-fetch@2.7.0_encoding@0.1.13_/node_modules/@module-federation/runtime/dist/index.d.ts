import { Federation, Module, ModuleFederation, ModuleFederationRuntimePlugin, UserOptions, getRemoteEntry, getRemoteInfo, loadScript, loadScriptNode, registerGlobalPlugins } from "@module-federation/runtime-core";

//#region src/index.d.ts
declare function createInstance(options: UserOptions): ModuleFederation;
/**
 * @deprecated Use createInstance or getInstance instead
 */
declare function init(options: UserOptions): ModuleFederation;
declare function loadRemote<T>(...args: Parameters<ModuleFederation['loadRemote']>): Promise<T | null>;
declare function loadShare<T>(...args: Parameters<ModuleFederation['loadShare']>): Promise<false | (() => T | undefined)>;
declare function loadShareSync<T>(...args: Parameters<ModuleFederation['loadShareSync']>): () => T | never;
declare function preloadRemote(...args: Parameters<ModuleFederation['preloadRemote']>): ReturnType<ModuleFederation['preloadRemote']>;
declare function registerRemotes(...args: Parameters<ModuleFederation['registerRemotes']>): ReturnType<ModuleFederation['registerRemotes']>;
declare function registerPlugins(...args: Parameters<ModuleFederation['registerPlugins']>): ReturnType<ModuleFederation['registerRemotes']>;
declare function getInstance(): ModuleFederation | null;
declare function registerShared(...args: Parameters<ModuleFederation['registerShared']>): ReturnType<ModuleFederation['registerShared']>;
//#endregion
export { type Federation, Module, ModuleFederation, type ModuleFederationRuntimePlugin, createInstance, getInstance, getRemoteEntry, getRemoteInfo, init, loadRemote, loadScript, loadScriptNode, loadShare, loadShareSync, preloadRemote, registerGlobalPlugins, registerPlugins, registerRemotes, registerShared };
//# sourceMappingURL=index.d.ts.map