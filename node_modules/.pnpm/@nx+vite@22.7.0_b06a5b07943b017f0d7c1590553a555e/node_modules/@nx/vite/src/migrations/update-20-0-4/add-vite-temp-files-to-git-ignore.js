"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addViteTempFilesToGitIgnore;
const ignore_vite_temp_files_1 = require("../../utils/ignore-vite-temp-files");
function addViteTempFilesToGitIgnore(tree) {
    // need to check if .gitignore exists before adding to it
    // then need to check if it contains the following pattern
    // **/vite.config.{js,ts,mjs,mts,cjs,cts}.timestamp*
    // if it does, remove just this pattern
    if (tree.exists('.gitignore')) {
        const gitIgnoreContents = tree.read('.gitignore', 'utf-8');
        if (gitIgnoreContents.includes('**/vite.config.{js,ts,mjs,mts,cjs,cts}.timestamp*')) {
            tree.write('.gitignore', gitIgnoreContents.replace('**/vite.config.{js,ts,mjs,mts,cjs,cts}.timestamp*', ''));
        }
    }
    (0, ignore_vite_temp_files_1.addViteTempFilesToGitIgnore)(tree);
}
