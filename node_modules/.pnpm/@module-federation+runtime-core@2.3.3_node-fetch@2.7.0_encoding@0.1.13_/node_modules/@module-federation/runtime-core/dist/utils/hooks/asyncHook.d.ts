import { ArgsType, SyncHook } from "./syncHook.js";

//#region src/utils/hooks/asyncHook.d.ts
type CallbackReturnType = void | false | Promise<void | false>;
declare class AsyncHook<T, ExternalEmitReturnType = CallbackReturnType> extends SyncHook<T, ExternalEmitReturnType> {
  emit(...data: ArgsType<T>): Promise<void | false | ExternalEmitReturnType>;
}
//#endregion
export { AsyncHook };
//# sourceMappingURL=asyncHook.d.ts.map