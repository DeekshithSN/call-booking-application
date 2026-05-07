"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeJs = maybeJs;
function maybeJs(options, path) {
    return options.js && (path.endsWith('.ts') || path.endsWith('.tsx'))
        ? path.replace(/\.tsx?$/, options.useJsx ? '.jsx' : '.js')
        : path;
}
