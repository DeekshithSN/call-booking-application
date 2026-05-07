import { MFContext } from "./MFContext.js";

//#region src/node.d.ts
declare function logAndReport<T extends (msg: string) => unknown>(code: string, descMap: Record<string, string>, args: Record<string, unknown>, logger: T, originalErrorMsg?: string, context?: Partial<MFContext>): ReturnType<T>;
//#endregion
export { logAndReport };
//# sourceMappingURL=node.d.ts.map