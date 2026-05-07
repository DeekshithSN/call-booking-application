import { MFContext } from "@module-federation/error-codes";

//#region src/utils/logger.d.ts
declare function assert(condition: any, msg: string): asserts condition;
declare function assert(condition: any, code: string, descMap: Record<string, string>, args?: Record<string, unknown>, context?: Partial<MFContext>): asserts condition;
declare function error(msg: string | Error | unknown): never;
declare function error(code: string, descMap: Record<string, string>, args?: Record<string, unknown>, originalErrorMsg?: string, context?: Partial<MFContext>): never;
//#endregion
export { assert, error };
//# sourceMappingURL=logger.d.ts.map