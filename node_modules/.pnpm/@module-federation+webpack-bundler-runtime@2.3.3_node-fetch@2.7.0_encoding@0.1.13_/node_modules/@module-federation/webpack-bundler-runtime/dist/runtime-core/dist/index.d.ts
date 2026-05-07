import { UserOptions } from "./type/config.js";
import { ModuleFederationRuntimePlugin } from "./type/plugin.js";
import { Federation, getGlobalSnapshot } from "./global.js";
import { getRemoteEntry } from "./utils/load.js";
import { ModuleFederation } from "./core.js";
import { Module$1 } from "./module/index.js";