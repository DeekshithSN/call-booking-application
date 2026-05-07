import { a as DTSManagerOptions } from "./DtsWorker-Dtem3-FM.js";

//#region src/dev-worker/DevWorker.d.ts
interface DevWorkerOptions extends DTSManagerOptions {
  name: string;
  disableLiveReload?: boolean;
  disableHotTypesReload?: boolean;
}
//#endregion
//#region src/dev-worker/forkDevWorker.d.ts
interface Options extends DevWorkerOptions {
  name: string;
}
declare function forkDevWorker(options: Options, action?: string): Promise<void>;
//#endregion
export { forkDevWorker };