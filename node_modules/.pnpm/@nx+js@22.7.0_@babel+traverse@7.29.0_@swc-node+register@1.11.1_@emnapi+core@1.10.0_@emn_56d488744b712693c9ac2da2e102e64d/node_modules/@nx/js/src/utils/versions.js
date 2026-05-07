"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedTypescriptVersions = exports.typescriptVersion = exports.verdaccioVersion = exports.typesNodeVersion = exports.tsLibVersion = exports.swcNodeVersion = exports.swcHelpersVersion = exports.swcCoreVersion = exports.swcCliVersion = exports.prettierVersion = exports.esbuildVersion = exports.nxVersion = void 0;
exports.nxVersion = require('../../package.json').version;
exports.esbuildVersion = '^0.27.0';
exports.prettierVersion = '~3.6.2';
exports.swcCliVersion = '~0.8.0';
exports.swcCoreVersion = '~1.15.5';
exports.swcHelpersVersion = '~0.5.18';
exports.swcNodeVersion = '~1.11.1';
exports.tsLibVersion = '^2.3.0';
exports.typesNodeVersion = '20.19.9';
exports.verdaccioVersion = '^6.3.2';
// Typescript
exports.typescriptVersion = '~5.9.2';
/**
 * The minimum version is currently determined from the lowest version
 * that's supported by the lowest Angular supported version, e.g.
 * `npm view @angular/compiler-cli@18.0.0 peerDependencies.typescript`
 */
exports.supportedTypescriptVersions = '>=5.4.0';
