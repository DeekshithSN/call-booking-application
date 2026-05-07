"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadViteDynamicImport = loadViteDynamicImport;
exports.loadVitestDynamicImport = loadVitestDynamicImport;
// TODO(jack): Remove this cast when @nx/vitest switches to moduleResolution:
// "nodenext". Vite 8 ships ESM-only type declarations (.d.mts) not resolvable
// under moduleResolution: "node".
function loadViteDynamicImport() {
    return Function('return import("vite")')();
}
function loadVitestDynamicImport() {
    return Function('return import("vitest/node")')();
}
