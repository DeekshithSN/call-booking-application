"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginName = void 0;
exports.generatePackageJson = generatePackageJson;
const update_package_json_1 = require("./update-package-json");
exports.pluginName = 'rollup-plugin-nx-generate-package-json';
function generatePackageJson(options, packageJson) {
    return {
        name: exports.pluginName,
        writeBundle: () => {
            (0, update_package_json_1.updatePackageJson)(options, packageJson);
        },
    };
}
