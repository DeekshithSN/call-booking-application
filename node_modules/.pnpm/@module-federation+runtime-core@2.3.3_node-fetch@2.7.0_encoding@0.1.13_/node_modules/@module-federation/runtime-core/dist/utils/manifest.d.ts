import { Remote } from "../type/config.js";
//#region src/utils/manifest.d.ts
declare function matchRemoteWithNameAndExpose(remotes: Array<Remote>, id: string): {
  pkgNameOrAlias: string;
  expose: string;
  remote: Remote;
} | undefined;
//#endregion
export { matchRemoteWithNameAndExpose };
//# sourceMappingURL=manifest.d.ts.map