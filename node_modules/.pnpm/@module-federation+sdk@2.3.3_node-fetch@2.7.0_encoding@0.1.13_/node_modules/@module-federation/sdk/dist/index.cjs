Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_constant = require('./constant.cjs');
const require_ContainerPlugin = require('./types/plugins/ContainerPlugin.cjs');
const require_ContainerReferencePlugin = require('./types/plugins/ContainerReferencePlugin.cjs');
const require_ModuleFederationPlugin = require('./types/plugins/ModuleFederationPlugin.cjs');
const require_SharePlugin = require('./types/plugins/SharePlugin.cjs');
const require_ConsumeSharedPlugin = require('./types/plugins/ConsumeSharedPlugin.cjs');
const require_ProvideSharedPlugin = require('./types/plugins/ProvideSharedPlugin.cjs');
const require_env = require('./env.cjs');
const require_utils = require('./utils.cjs');
const require_generateSnapshotFromManifest = require('./generateSnapshotFromManifest.cjs');
const require_logger = require('./logger.cjs');
const require_dom = require('./dom.cjs');
const require_node = require('./node.cjs');
const require_normalizeOptions = require('./normalizeOptions.cjs');
const require_createModuleFederationConfig = require('./createModuleFederationConfig.cjs');

exports.BROWSER_LOG_KEY = require_constant.BROWSER_LOG_KEY;
exports.ENCODE_NAME_PREFIX = require_constant.ENCODE_NAME_PREFIX;
exports.EncodedNameTransformMap = require_constant.EncodedNameTransformMap;
exports.FederationModuleManifest = require_constant.FederationModuleManifest;
exports.MANIFEST_EXT = require_constant.MANIFEST_EXT;
exports.MFModuleType = require_constant.MFModuleType;
exports.MFPrefetchCommon = require_constant.MFPrefetchCommon;
exports.MODULE_DEVTOOL_IDENTIFIER = require_constant.MODULE_DEVTOOL_IDENTIFIER;
exports.ManifestFileName = require_constant.ManifestFileName;
exports.NameTransformMap = require_constant.NameTransformMap;
exports.NameTransformSymbol = require_constant.NameTransformSymbol;
exports.SEPARATOR = require_constant.SEPARATOR;
exports.StatsFileName = require_constant.StatsFileName;
exports.TEMP_DIR = require_constant.TEMP_DIR;
exports.TreeShakingStatus = require_constant.TreeShakingStatus;
exports.assert = require_utils.assert;
exports.bindLoggerToCompiler = require_logger.bindLoggerToCompiler;
exports.composeKeyWithSeparator = require_utils.composeKeyWithSeparator;
Object.defineProperty(exports, 'consumeSharedPlugin', {
  enumerable: true,
  get: function () {
    return require_ConsumeSharedPlugin.ConsumeSharedPlugin_exports;
  }
});
Object.defineProperty(exports, 'containerPlugin', {
  enumerable: true,
  get: function () {
    return require_ContainerPlugin.ContainerPlugin_exports;
  }
});
Object.defineProperty(exports, 'containerReferencePlugin', {
  enumerable: true,
  get: function () {
    return require_ContainerReferencePlugin.ContainerReferencePlugin_exports;
  }
});
exports.createInfrastructureLogger = require_logger.createInfrastructureLogger;
exports.createLink = require_dom.createLink;
exports.createLogger = require_logger.createLogger;
exports.createModuleFederationConfig = require_createModuleFederationConfig.createModuleFederationConfig;
exports.createScript = require_dom.createScript;
exports.createScriptNode = require_node.createScriptNode;
exports.decodeName = require_utils.decodeName;
exports.encodeName = require_utils.encodeName;
exports.error = require_utils.error;
exports.generateExposeFilename = require_utils.generateExposeFilename;
exports.generateShareFilename = require_utils.generateShareFilename;
exports.generateSnapshotFromManifest = require_generateSnapshotFromManifest.generateSnapshotFromManifest;
exports.getManifestFileName = require_generateSnapshotFromManifest.getManifestFileName;
exports.getProcessEnv = require_env.getProcessEnv;
exports.getResourceUrl = require_utils.getResourceUrl;
exports.inferAutoPublicPath = require_generateSnapshotFromManifest.inferAutoPublicPath;
exports.infrastructureLogger = require_logger.infrastructureLogger;
exports.isBrowserEnv = require_env.isBrowserEnv;
exports.isBrowserEnvValue = require_env.isBrowserEnvValue;
exports.isDebugMode = require_env.isDebugMode;
exports.isManifestProvider = require_generateSnapshotFromManifest.isManifestProvider;
exports.isReactNativeEnv = require_env.isReactNativeEnv;
exports.isRequiredVersion = require_utils.isRequiredVersion;
exports.isStaticResourcesEqual = require_dom.isStaticResourcesEqual;
exports.loadScript = require_dom.loadScript;
exports.loadScriptNode = require_node.loadScriptNode;
exports.logger = require_logger.logger;
Object.defineProperty(exports, 'moduleFederationPlugin', {
  enumerable: true,
  get: function () {
    return require_ModuleFederationPlugin.ModuleFederationPlugin_exports;
  }
});
exports.normalizeOptions = require_normalizeOptions.normalizeOptions;
exports.parseEntry = require_utils.parseEntry;
Object.defineProperty(exports, 'provideSharedPlugin', {
  enumerable: true,
  get: function () {
    return require_ProvideSharedPlugin.ProvideSharedPlugin_exports;
  }
});
exports.safeToString = require_utils.safeToString;
exports.safeWrapper = require_dom.safeWrapper;
Object.defineProperty(exports, 'sharePlugin', {
  enumerable: true,
  get: function () {
    return require_SharePlugin.SharePlugin_exports;
  }
});
exports.simpleJoinRemoteEntry = require_generateSnapshotFromManifest.simpleJoinRemoteEntry;
exports.warn = require_utils.warn;