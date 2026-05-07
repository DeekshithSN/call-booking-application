"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePackageJson = updatePackageJson;
const path_1 = require("path");
const fileutils_1 = require("nx/src/utils/fileutils");
const fs_1 = require("fs");
const devkit_1 = require("@nx/devkit");
function updatePackageJson(options, packageJson) {
    const jsFileRegex = /(\.cjs|\.mjs|\.esm\.js|\.cjs\.js|\.mjs\.js|\.js)$/;
    const hasEsmFormat = options.format.includes('esm');
    const hasCjsFormat = options.format.includes('cjs');
    if (options.generateExportsField) {
        packageJson.exports =
            typeof packageJson.exports === 'string' ? {} : { ...packageJson.exports };
        packageJson.exports['./package.json'] = './package.json';
    }
    if (hasEsmFormat) {
        const esmExports = getExports({
            ...options,
            fileExt: '.esm.js',
        });
        packageJson.module = esmExports['.'];
        if (!hasCjsFormat) {
            if (!options.skipTypeField)
                packageJson.type = 'module';
            packageJson.main ??= esmExports['.'];
        }
        if (options.generateExportsField) {
            for (const [exportEntry, filePath] of Object.entries(esmExports)) {
                packageJson.exports[exportEntry] =
                    // If CJS format is used, make sure `import` (from Node) points to same instance of the package.
                    // Otherwise, packages that are required to be singletons (like React, RxJS, etc.) will break.
                    // Reserve `module` entry for bundlers to accommodate tree-shaking.
                    {
                        [hasCjsFormat ? 'module' : 'import']: filePath,
                        types: filePath.replace(jsFileRegex, '.d.ts'),
                    };
            }
        }
    }
    if (hasCjsFormat) {
        const cjsExports = getExports({
            ...options,
            fileExt: '.cjs.js',
        });
        packageJson.main = cjsExports['.'];
        if (!hasEsmFormat && !options.skipTypeField) {
            packageJson.type = 'commonjs';
        }
        if (options.generateExportsField) {
            for (const [exportEntry, filePath] of Object.entries(cjsExports)) {
                if (hasEsmFormat) {
                    // If ESM format used, make sure `import` (from Node) points to a wrapped
                    // version of CJS file to ensure the package remains a singleton.
                    // TODO(jack): This can be made into a rollup plugin to re-use in Vite.
                    const relativeFile = (0, path_1.parse)(filePath).base;
                    const fauxEsmFilePath = filePath.replace(/\.cjs\.js$/, '.cjs.mjs');
                    packageJson.exports[exportEntry]['import'] ??= fauxEsmFilePath;
                    packageJson.exports[exportEntry]['default'] ??= filePath;
                    // Set `types` field only if it's not already set as the preferred ESM Format.
                    packageJson.exports[exportEntry]['types'] ??= filePath.replace(/\.js$/, '.d.ts');
                    // Re-export from relative CJS file, and Node will synthetically export it as ESM.
                    // Make sure both ESM and CJS point to same instance of the package because libs like React, RxJS, etc. requires it.
                    // Also need a special .cjs.default.js file that re-exports the `default` from CJS, or else
                    // default import in Node will not work.
                    (0, fs_1.writeFileSync)((0, path_1.join)(devkit_1.workspaceRoot, options.outputPath, filePath.replace(/\.cjs\.js$/, '.cjs.default.js')), `exports._default = require('./${(0, path_1.parse)(filePath).base}').default;`);
                    (0, fs_1.writeFileSync)((0, path_1.join)(devkit_1.workspaceRoot, options.outputPath, fauxEsmFilePath), 
                    // Re-export from relative CJS file, and Node will synthetically export it as ESM.
                    (0, devkit_1.stripIndents) `
            export * from './${relativeFile}';
            export { _default as default } from './${relativeFile.replace(/\.cjs\.js$/, '.cjs.default.js')}';
            `);
                }
                else {
                    packageJson.exports[exportEntry] = filePath;
                }
            }
        }
    }
    if (packageJson.module) {
        packageJson.types ??= packageJson.module.replace(jsFileRegex, '.d.ts');
    }
    else {
        packageJson.types ??= packageJson.main.replace(jsFileRegex, '.d.ts');
    }
    (0, fileutils_1.writeJsonFile)((0, path_1.join)(devkit_1.workspaceRoot, options.outputPath, 'package.json'), packageJson);
}
function getExports(options) {
    const exports = {};
    // Users may provide custom input option and skip the main field.
    if (options.main) {
        const mainFile = options.outputFileName
            ? options.outputFileName.replace(/\.[tj]s$/, '')
            : (0, path_1.basename)(options.main).replace(/\.[tj]s$/, '');
        exports['.'] = './' + mainFile + options.fileExt;
    }
    if (options.additionalEntryPoints) {
        for (const file of options.additionalEntryPoints) {
            const { name: fileName } = (0, path_1.parse)(file);
            exports['./' + fileName] = './' + fileName + options.fileExt;
        }
    }
    return exports;
}
