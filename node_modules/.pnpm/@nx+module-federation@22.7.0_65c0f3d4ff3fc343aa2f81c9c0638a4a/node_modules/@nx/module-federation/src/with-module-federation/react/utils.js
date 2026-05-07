"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDefaultEagerPackages = applyDefaultEagerPackages;
function applyDefaultEagerPackages(sharedConfig) {
    const DEFAULT_REACT_PACKAGES_TO_LOAD_EAGERLY = [
        'react',
        'react-dom',
        'react-router-dom',
        'react-router',
    ];
    for (const pkg of DEFAULT_REACT_PACKAGES_TO_LOAD_EAGERLY) {
        if (!sharedConfig[pkg]) {
            continue;
        }
        sharedConfig[pkg] = { ...sharedConfig[pkg], eager: true };
    }
}
