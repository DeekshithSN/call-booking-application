"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addVitestTempFilesToGitIgnore;
const ignore_vitest_temp_files_1 = require("../../utils/ignore-vitest-temp-files");
function addVitestTempFilesToGitIgnore(tree) {
    // need to check if .gitignore exists before adding to it
    // then need to check if it contains the following pattern
    // **/vite.config.{js,ts,mjs,mts,cjs,cts}.timestamp*
    // if it does, remove just this pattern
    if (tree.exists('.gitignore')) {
        const gitIgnoreContents = tree.read('.gitignore', 'utf-8');
        if (gitIgnoreContents.includes('**/vitest.config.{js,ts,mjs,mts,cjs,cts}.timestamp*')) {
            tree.write('.gitignore', gitIgnoreContents.replace('**/vitest.config.{js,ts,mjs,mts,cjs,cts}.timestamp*', ''));
        }
    }
    (0, ignore_vitest_temp_files_1.addVitestTempFilesToGitIgnore)(tree);
}
