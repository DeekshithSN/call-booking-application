import { BROWSER_LOG_KEY, ENCODE_NAME_PREFIX, EncodedNameTransformMap, FederationModuleManifest, MANIFEST_EXT, MFModuleType, MFPrefetchCommon, MODULE_DEVTOOL_IDENTIFIER, ManifestFileName, NameTransformMap, NameTransformSymbol, SEPARATOR, StatsFileName, TEMP_DIR, TreeShakingStatus } from "./constant.js";
import { ContainerPlugin_exports } from "./types/plugins/ContainerPlugin.js";
import { ContainerReferencePlugin_exports } from "./types/plugins/ContainerReferencePlugin.js";
import { ModuleFederationPlugin_exports } from "./types/plugins/ModuleFederationPlugin.js";
import { SharePlugin_exports } from "./types/plugins/SharePlugin.js";
import { ConsumeSharedPlugin_exports } from "./types/plugins/ConsumeSharedPlugin.js";
import { ProvideSharedPlugin_exports } from "./types/plugins/ProvideSharedPlugin.js";
import { getProcessEnv, isBrowserEnv, isBrowserEnvValue, isDebugMode, isReactNativeEnv } from "./env.js";
import { assert, composeKeyWithSeparator, decodeName, encodeName, error, generateExposeFilename, generateShareFilename, getResourceUrl, isRequiredVersion, parseEntry, safeToString, warn } from "./utils.js";
import { generateSnapshotFromManifest, getManifestFileName, inferAutoPublicPath, isManifestProvider, simpleJoinRemoteEntry } from "./generateSnapshotFromManifest.js";
import { bindLoggerToCompiler, createInfrastructureLogger, createLogger, infrastructureLogger, logger } from "./logger.js";
import { createLink, createScript, isStaticResourcesEqual, loadScript, safeWrapper } from "./dom.js";
import { createScriptNode, loadScriptNode } from "./node.js";
import { normalizeOptions } from "./normalizeOptions.js";
import { createModuleFederationConfig } from "./createModuleFederationConfig.js";

export { BROWSER_LOG_KEY, ENCODE_NAME_PREFIX, EncodedNameTransformMap, FederationModuleManifest, MANIFEST_EXT, MFModuleType, MFPrefetchCommon, MODULE_DEVTOOL_IDENTIFIER, ManifestFileName, NameTransformMap, NameTransformSymbol, SEPARATOR, StatsFileName, TEMP_DIR, TreeShakingStatus, assert, bindLoggerToCompiler, composeKeyWithSeparator, ConsumeSharedPlugin_exports as consumeSharedPlugin, ContainerPlugin_exports as containerPlugin, ContainerReferencePlugin_exports as containerReferencePlugin, createInfrastructureLogger, createLink, createLogger, createModuleFederationConfig, createScript, createScriptNode, decodeName, encodeName, error, generateExposeFilename, generateShareFilename, generateSnapshotFromManifest, getManifestFileName, getProcessEnv, getResourceUrl, inferAutoPublicPath, infrastructureLogger, isBrowserEnv, isBrowserEnvValue, isDebugMode, isManifestProvider, isReactNativeEnv, isRequiredVersion, isStaticResourcesEqual, loadScript, loadScriptNode, logger, ModuleFederationPlugin_exports as moduleFederationPlugin, normalizeOptions, parseEntry, ProvideSharedPlugin_exports as provideSharedPlugin, safeToString, safeWrapper, SharePlugin_exports as sharePlugin, simpleJoinRemoteEntry, warn };