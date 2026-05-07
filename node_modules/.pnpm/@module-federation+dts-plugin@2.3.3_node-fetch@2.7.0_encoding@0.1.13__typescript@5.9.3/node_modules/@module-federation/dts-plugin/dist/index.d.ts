import { a as DTSManagerOptions } from "./DtsWorker-Dtem3-FM.js";
import { d as isTSProject } from "./constant-BwEkyidO.js";
import { moduleFederationPlugin } from "@module-federation/sdk";

//#region src/plugins/DtsPlugin.d.ts
declare const normalizeDtsOptions: (options: moduleFederationPlugin.ModuleFederationPluginOptions, context: string, defaultOptions?: {
  defaultGenerateOptions?: moduleFederationPlugin.DtsRemoteOptions;
  defaultConsumeOptions?: moduleFederationPlugin.DtsHostOptions;
}) => false | moduleFederationPlugin.PluginDtsOptions;
declare class DtsPlugin implements WebpackPluginInstance {
  options: moduleFederationPlugin.ModuleFederationPluginOptions;
  clonedOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions);
  apply(compiler: Compiler): void;
  addRuntimePlugins(): void;
}
//#endregion
//#region src/plugins/ConsumeTypesPlugin.d.ts
declare const normalizeConsumeTypesOptions: ({
  context,
  dtsOptions,
  pluginOptions
}: {
  context?: string;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
}) => {
  host: {
    typesFolder?: string;
    abortOnError?: boolean;
    remoteTypesFolder?: string;
    deleteTypesFolder?: boolean;
    maxRetries?: number;
    consumeAPITypes?: boolean;
    runtimePkgs?: string[];
    remoteTypeUrls?: (() => Promise<moduleFederationPlugin.RemoteTypeUrls>) | moduleFederationPlugin.RemoteTypeUrls;
    timeout?: number;
    family?: 4 | 6;
    typesOnBuild?: boolean;
    implementation: string;
    context: string;
    moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  };
  extraOptions: Record<string, any>;
  displayErrorInTerminal: boolean;
};
declare const consumeTypesAPI: (dtsManagerOptions: DTSManagerOptions, cb?: (options: moduleFederationPlugin.RemoteTypeUrls) => void) => Promise<void>;
//#endregion
//#region src/plugins/GenerateTypesPlugin.d.ts
declare const normalizeGenerateTypesOptions: ({
  context,
  outputDir,
  dtsOptions,
  pluginOptions
}: {
  context?: string;
  outputDir?: string;
  dtsOptions: moduleFederationPlugin.PluginDtsOptions;
  pluginOptions: moduleFederationPlugin.ModuleFederationPluginOptions;
}) => DTSManagerOptions;
declare const generateTypesAPI: ({
  dtsManagerOptions
}: {
  dtsManagerOptions: DTSManagerOptions;
}) => Promise<void>;
//#endregion
export { DtsPlugin, consumeTypesAPI, generateTypesAPI, isTSProject, normalizeConsumeTypesOptions, normalizeDtsOptions, normalizeGenerateTypesOptions };