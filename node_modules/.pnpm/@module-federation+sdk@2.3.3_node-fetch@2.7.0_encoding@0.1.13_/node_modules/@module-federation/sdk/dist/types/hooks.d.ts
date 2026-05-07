//#region src/types/hooks.d.ts
type CreateScriptHookReturnNode = {
  url: string;
} | void;
type CreateScriptHookReturnDom = HTMLScriptElement | {
  script?: HTMLScriptElement;
  timeout?: number;
} | void;
type CreateScriptHookReturn = CreateScriptHookReturnNode | CreateScriptHookReturnDom;
type CreateScriptHookNode = (url: string, attrs?: Record<string, any> | undefined) => CreateScriptHookReturnNode;
type CreateScriptHookDom = (url: string, attrs?: Record<string, any> | undefined) => CreateScriptHookReturnDom;
type CreateScriptHook = (url: string, attrs?: Record<string, any> | undefined) => CreateScriptHookReturn;
type FetchHook = (args: [string, RequestInit]) => Promise<Response> | void | false;
//#endregion
export { CreateScriptHook, CreateScriptHookDom, CreateScriptHookNode, CreateScriptHookReturn, CreateScriptHookReturnDom, CreateScriptHookReturnNode, FetchHook };
//# sourceMappingURL=hooks.d.ts.map