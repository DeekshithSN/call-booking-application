"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = installJiti;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../utils/versions");
async function installJiti(tree) {
    const installTask = (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
        jiti: versions_1.jitiVersion,
    });
    return installTask;
}
