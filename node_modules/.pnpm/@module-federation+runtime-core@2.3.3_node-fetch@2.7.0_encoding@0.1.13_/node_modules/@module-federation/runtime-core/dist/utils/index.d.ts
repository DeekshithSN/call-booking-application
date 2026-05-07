import { isStaticResourcesEqual, safeWrapper } from "./tool.js";
import { matchRemoteWithNameAndExpose } from "./manifest.js";
import { assert, error } from "./logger.js";
import { getRemoteEntry, getRemoteInfo } from "./load.js";