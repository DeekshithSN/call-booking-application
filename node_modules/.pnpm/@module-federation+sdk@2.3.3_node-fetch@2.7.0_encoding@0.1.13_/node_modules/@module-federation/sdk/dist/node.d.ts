import { CreateScriptHookNode, FetchHook } from "./types/hooks.js";
//#region src/node.d.ts
declare const createScriptNode: (url: string, cb: (error?: Error, scriptContext?: any) => void, attrs?: Record<string, any>, loaderHook?: {
  createScriptHook?: CreateScriptHookNode;
  fetch?: FetchHook;
}) => void;
declare const loadScriptNode: (url: string, info: {
  attrs?: Record<string, any>;
  loaderHook?: {
    createScriptHook?: CreateScriptHookNode;
  };
}) => Promise<void>;
//#endregion
export { createScriptNode, loadScriptNode };
//# sourceMappingURL=node.d.ts.map