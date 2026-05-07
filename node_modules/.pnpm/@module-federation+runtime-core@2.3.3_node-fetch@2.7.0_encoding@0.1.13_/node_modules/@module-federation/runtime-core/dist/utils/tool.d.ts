import { ModuleInfo, RemoteEntryType, RemoteWithEntry } from "@module-federation/sdk";

//#region src/utils/tool.d.ts
declare function safeWrapper<T extends (...args: Array<any>) => any>(callback: T, disableWarn?: boolean): Promise<ReturnType<T> | undefined>;
declare function isStaticResourcesEqual(url1: string, url2: string): boolean;
//#endregion
export { isStaticResourcesEqual, safeWrapper };
//# sourceMappingURL=tool.d.ts.map