import { assert, error, logger, warn } from "./logger.js";
import { addUniqueItem, arrayOptions, getFMId, getRemoteEntryInfoFromSnapshot, isObject, isPlainObject, isPureRemoteEntry, isRemoteInfoWithEntry, isStaticResourcesEqual, objectToString, processModuleAlias, safeWrapper } from "./tool.js";
import { getBuilderId } from "./env.js";
import { matchRemote, matchRemoteWithNameAndExpose } from "./manifest.js";
import { registerPlugins } from "./plugin.js";
import { getRemoteEntry, getRemoteEntryUniqueKey, getRemoteInfo } from "./load.js";
import { optionsToMFContext } from "./context.js";

export {  };