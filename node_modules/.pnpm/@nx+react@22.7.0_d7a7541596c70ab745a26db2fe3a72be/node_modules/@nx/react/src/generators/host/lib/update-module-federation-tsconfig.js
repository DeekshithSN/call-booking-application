"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModuleFederationTsconfig = updateModuleFederationTsconfig;
const devkit_1 = require("@nx/devkit");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
function updateModuleFederationTsconfig(host, options) {
    const tsconfigPath = (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.json');
    const tsconfigRuntimePath = (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.app.json');
    if (!host.exists(tsconfigPath) || !host.exists(tsconfigRuntimePath))
        return;
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
        // Update references to match what `nx sync` does.
        if (options.remotes?.length) {
            (0, devkit_1.updateJson)(host, tsconfigPath, (json) => {
                json.references ??= [];
                for (const remote of options.remotes) {
                    const remotePath = `../${remote}`;
                    if (!json.references.some((ref) => ref.path === remotePath))
                        json.references.push({ path: remotePath });
                }
                return json;
            });
            (0, devkit_1.updateJson)(host, tsconfigRuntimePath, (json) => {
                json.references ??= [];
                for (const remote of options.remotes) {
                    const remotePath = `../${remote}/tsconfig.app.json`;
                    if (!json.references.some((ref) => ref.path === remotePath))
                        json.references.push({ path: remotePath });
                }
                return json;
            });
        }
    }
}
