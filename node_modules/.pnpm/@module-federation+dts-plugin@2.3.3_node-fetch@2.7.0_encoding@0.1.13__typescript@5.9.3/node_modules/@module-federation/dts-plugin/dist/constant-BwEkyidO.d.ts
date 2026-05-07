import { a as DTSManagerOptions, i as DTSManager, l as TsConfigJson, o as HostOptions, s as RemoteInfo, u as RemoteOptions } from "./DtsWorker-Dtem3-FM.js";
import { moduleFederationPlugin } from "@module-federation/sdk";

//#region src/core/configurations/hostPlugin.d.ts
declare const retrieveHostConfig: (options: HostOptions) => {
  hostOptions: Required<HostOptions>;
  mapRemotesToDownload: Record<string, RemoteInfo>;
};
//#endregion
//#region src/core/lib/utils.d.ts
declare function getDTSManagerConstructor(implementation?: string): typeof DTSManager;
declare const validateOptions: (options: HostOptions) => void;
declare function retrieveTypesAssetsInfo(options: RemoteOptions): {
  apiTypesPath: string;
  zipTypesPath: string;
  zipName: string;
  apiFileName: string;
};
declare const isTSProject: (dtsOptions: moduleFederationPlugin.ModuleFederationPluginOptions["dts"], context?: string) => boolean;
//#endregion
//#region src/core/lib/typeScriptCompiler.d.ts
declare const retrieveMfTypesPath: (tsConfig: TsConfigJson, remoteOptions: Required<RemoteOptions>) => string;
declare const retrieveOriginalOutDir: (tsConfig: TsConfigJson, remoteOptions: Required<RemoteOptions>) => string;
//#endregion
//#region src/core/lib/archiveHandler.d.ts
declare const retrieveTypesZipPath: (mfTypesPath: string, remoteOptions: Required<RemoteOptions>) => string;
//#endregion
//#region src/core/lib/generateTypes.d.ts
declare function generateTypes(options: DTSManagerOptions): Promise<void>;
//#endregion
//#region src/core/lib/generateTypesInChildProcess.d.ts
declare function generateTypesInChildProcess(options: DTSManagerOptions): Promise<void>;
//#endregion
//#region src/core/lib/consumeTypes.d.ts
declare function consumeTypes(options: DTSManagerOptions): Promise<void>;
//#endregion
//#region src/core/constant.d.ts
declare const REMOTE_ALIAS_IDENTIFIER = "REMOTE_ALIAS_IDENTIFIER";
declare const REMOTE_API_TYPES_FILE_NAME = "apis.d.ts";
declare const HOST_API_TYPES_FILE_NAME = "index.d.ts";
//#endregion
export { generateTypesInChildProcess as a, retrieveMfTypesPath as c, isTSProject as d, retrieveTypesAssetsInfo as f, consumeTypes as i, retrieveOriginalOutDir as l, retrieveHostConfig as m, REMOTE_ALIAS_IDENTIFIER as n, generateTypes as o, validateOptions as p, REMOTE_API_TYPES_FILE_NAME as r, retrieveTypesZipPath as s, HOST_API_TYPES_FILE_NAME as t, getDTSManagerConstructor as u };