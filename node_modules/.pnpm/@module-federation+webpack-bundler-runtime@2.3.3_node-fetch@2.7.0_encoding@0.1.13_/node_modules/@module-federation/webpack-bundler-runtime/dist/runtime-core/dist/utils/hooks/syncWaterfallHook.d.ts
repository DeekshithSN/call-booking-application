import { SyncHook } from "./syncHook.js";

//#region ../runtime-core/dist/utils/hooks/syncWaterfallHook.d.ts
//#region src/utils/hooks/syncWaterfallHook.d.ts
declare class SyncWaterfallHook<T extends Record<string, any>> extends SyncHook<[T], T> {
  onerror: (errMsg: string | Error | unknown) => void;
  constructor(type: string);
  emit(data: T): T;
} //#endregion
//#endregion
export { SyncWaterfallHook };
//# sourceMappingURL=syncWaterfallHook.d.ts.map