//#region src/types/common.d.ts
interface RemoteWithEntry {
  name: string;
  entry: string;
}
interface RemoteWithVersion {
  name: string;
  version: string;
}
type RemoteEntryInfo = RemoteWithEntry | RemoteWithVersion;
type Module = any;
//#endregion
export { Module, RemoteEntryInfo, RemoteWithEntry, RemoteWithVersion };
//# sourceMappingURL=common.d.ts.map