"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const ts_solution_setup_1 = require("../../utils/typescript/ts-solution-setup");
const typescript_sync_1 = require("../../generators/typescript-sync/typescript-sync");
async function default_1(tree) {
    // Skip if not using TypeScript solution setup
    if (!(0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree)) {
        return;
    }
    await (0, typescript_sync_1.syncGenerator)(tree);
}
