//#region src/env.d.ts
declare global {
  var FEDERATION_DEBUG: string | undefined;
}
declare const isBrowserEnvValue: boolean;
declare function isBrowserEnv(): boolean;
declare function isReactNativeEnv(): boolean;
declare function isDebugMode(): boolean;
declare const getProcessEnv: () => Record<string, string | undefined>;
//#endregion
export { getProcessEnv, isBrowserEnv, isBrowserEnvValue, isDebugMode, isReactNativeEnv };
//# sourceMappingURL=env.d.ts.map