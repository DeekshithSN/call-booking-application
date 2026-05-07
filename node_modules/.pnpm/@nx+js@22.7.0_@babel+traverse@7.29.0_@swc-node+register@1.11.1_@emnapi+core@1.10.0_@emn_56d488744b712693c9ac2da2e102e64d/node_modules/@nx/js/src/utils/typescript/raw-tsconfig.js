"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walkTsconfigExtendsChain = walkTsconfigExtendsChain;
const devkit_1 = require("@nx/devkit");
const node_path_1 = require("node:path");
/**
 * Walks the `extends` chain of a tsconfig, invoking `visit` for each unique
 * reachable file (entry first, then recursively). Cycle-safe. Files that
 * don't exist or fail to parse are silently skipped.
 *
 * When a tsconfig has multiple `extends` entries they are visited in
 * REVERSE order, so visitors looking for the effective value of an
 * inherited option see the highest-precedence entries first and can
 * return `'stop'` to abort the traversal. Visitors that want to collect
 * every reachable file should always return `'continue'`.
 *
 * @param entryAbsolutePath Absolute, canonical path of the tsconfig to
 *   start from. Pass through `path.resolve()` if unsure.
 * @param visit Invoked once per unique reachable tsconfig.
 * @param options.jsonCache Optional shared cache of parsed tsconfig
 *   contents. When omitted, the walker uses a fresh internal cache.
 */
function walkTsconfigExtendsChain(entryAbsolutePath, visit, options) {
    const jsonCache = options?.jsonCache ?? new Map();
    walk(entryAbsolutePath, visit, jsonCache, new Set());
}
function walk(absolutePath, visit, jsonCache, visited) {
    if (visited.has(absolutePath))
        return 'continue';
    visited.add(absolutePath);
    const json = readCachedJson(absolutePath, jsonCache);
    if (json === null)
        return 'continue';
    if (visit(absolutePath, json) === 'stop')
        return 'stop';
    const extendsField = json.extends;
    if (!extendsField)
        return 'continue';
    const extendsList = Array.isArray(extendsField)
        ? extendsField
        : [extendsField];
    // Last entry wins per TypeScript precedence; walk in reverse so
    // precedence-aware visitors see the highest-precedence entries first.
    const fromDir = (0, node_path_1.dirname)(absolutePath);
    for (let i = extendsList.length - 1; i >= 0; i--) {
        const ext = extendsList[i];
        if (typeof ext !== 'string' || !ext)
            continue;
        const childPath = resolveExtendsPath(ext, fromDir);
        if (childPath === null)
            continue;
        if (walk(childPath, visit, jsonCache, visited) === 'stop')
            return 'stop';
    }
    return 'continue';
}
function readCachedJson(absolutePath, cache) {
    if (cache.has(absolutePath)) {
        return cache.get(absolutePath) ?? null;
    }
    let parsed;
    try {
        parsed = (0, devkit_1.readJsonFile)(absolutePath);
    }
    catch {
        parsed = null;
    }
    cache.set(absolutePath, parsed);
    return parsed;
}
function resolveExtendsPath(extendsValue, fromDir) {
    try {
        return require.resolve(extendsValue, { paths: [fromDir] });
    }
    catch {
        return null;
    }
}
