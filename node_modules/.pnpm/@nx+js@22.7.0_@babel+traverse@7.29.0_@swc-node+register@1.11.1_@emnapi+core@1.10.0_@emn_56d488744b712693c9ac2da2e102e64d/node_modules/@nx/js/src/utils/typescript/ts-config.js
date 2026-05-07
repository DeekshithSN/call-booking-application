"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTsConfig = readTsConfig;
exports.readTsConfigFromTree = readTsConfigFromTree;
exports.getRootTsConfigPathInTree = getRootTsConfigPathInTree;
exports.getRelativePathToRootTsConfig = getRelativePathToRootTsConfig;
exports.getRootTsConfigPath = getRootTsConfigPath;
exports.getRootTsConfigFileName = getRootTsConfigFileName;
exports.addTsConfigPath = addTsConfigPath;
exports.resolvePathsBaseUrl = resolvePathsBaseUrl;
exports.readTsConfigPaths = readTsConfigPaths;
const devkit_1 = require("@nx/devkit");
const fs_1 = require("fs");
const path_1 = require("path");
const ensure_typescript_1 = require("./ensure-typescript");
let tsModule;
function readTsConfig(tsConfigPath, sys) {
    if (!tsModule) {
        tsModule = require('typescript');
    }
    sys ??= tsModule.sys;
    const readResult = tsModule.readConfigFile(tsConfigPath, sys.readFile);
    return tsModule.parseJsonConfigFileContent(readResult.config, sys, (0, path_1.dirname)(tsConfigPath));
}
function readTsConfigFromTree(tree, tsConfigPath) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const tsSysFromTree = {
        ...tsModule.sys,
        readFile: (path) => tree.read(path, 'utf-8'),
    };
    return readTsConfig(tsConfigPath, tsSysFromTree);
}
function getRootTsConfigPathInTree(tree) {
    for (const path of ['tsconfig.base.json', 'tsconfig.json']) {
        if (tree.exists(path)) {
            return path;
        }
    }
    return 'tsconfig.base.json';
}
function getRelativePathToRootTsConfig(tree, targetPath) {
    return (0, devkit_1.offsetFromRoot)(targetPath) + getRootTsConfigPathInTree(tree);
}
function getRootTsConfigPath() {
    const tsConfigFileName = getRootTsConfigFileName();
    return tsConfigFileName ? (0, path_1.join)(devkit_1.workspaceRoot, tsConfigFileName) : null;
}
function getRootTsConfigFileName(tree) {
    for (const tsConfigName of ['tsconfig.base.json', 'tsconfig.json']) {
        const pathExists = tree
            ? tree.exists(tsConfigName)
            : (0, fs_1.existsSync)((0, path_1.join)(devkit_1.workspaceRoot, tsConfigName));
        if (pathExists) {
            return tsConfigName;
        }
    }
    return null;
}
function addTsConfigPath(tree, importPath, lookupPaths) {
    (0, devkit_1.updateJson)(tree, getRootTsConfigPathInTree(tree), (json) => {
        json.compilerOptions ??= {};
        const c = json.compilerOptions;
        c.paths ??= {};
        if (c.paths[importPath]) {
            throw new Error(`You already have a library using the import path "${importPath}". Make sure to specify a unique one.`);
        }
        c.paths[importPath] = lookupPaths.map(ensureRelativePath);
        return json;
    });
}
function ensureRelativePath(p) {
    if (p.startsWith('./') || p.startsWith('../') || p.startsWith('/')) {
        return p;
    }
    return `./${p}`;
}
/**
 * When `baseUrl` is not set and `paths` are inherited via `extends`,
 * tools like `tsconfig-paths` resolve from the loaded file's directory
 * instead of the file where `paths` is defined. This walks the `extends`
 * chain to find the correct resolution base.
 *
 * Returns the directory that `paths` values should be resolved relative to.
 * Walks the tsconfig `extends` chain to find where `paths` is defined, then
 * looks for the applicable `baseUrl` from that point toward the root of the
 * chain (ignoring child overrides that don't apply to the paths-defining
 * tsconfig). When no `baseUrl` applies, returns the directory of the
 * tsconfig that defines `paths`.
 */
function resolvePathsBaseUrl(tsconfigPath) {
    const chain = [];
    const queue = [tsconfigPath];
    while (queue.length > 0) {
        const absolute = (0, path_1.resolve)(queue.shift());
        const dir = (0, path_1.dirname)(absolute);
        try {
            const raw = JSON.parse((0, fs_1.readFileSync)(absolute, 'utf-8'));
            chain.push({ dir, raw });
            const exts = raw.extends
                ? Array.isArray(raw.extends)
                    ? raw.extends
                    : [raw.extends]
                : [];
            for (const ext of exts) {
                const resolved = resolveExtendsPath(ext, dir);
                if (resolved) {
                    queue.push(resolved);
                }
            }
        }
        catch {
            // skip unreadable files
        }
    }
    // Find where paths is defined.
    let pathsIndex = -1;
    for (let i = 0; i < chain.length; i++) {
        if (chain[i].raw.compilerOptions?.paths &&
            Object.keys(chain[i].raw.compilerOptions.paths).length > 0) {
            pathsIndex = i;
            break;
        }
    }
    // Find the applicable baseUrl: search from the paths-defining tsconfig
    // toward the root. Child overrides before the paths-defining tsconfig
    // are ignored — they don't apply to the paths that were written for a
    // different baseUrl context.
    const searchStart = pathsIndex >= 0 ? pathsIndex : 0;
    for (let i = searchStart; i < chain.length; i++) {
        if (chain[i].raw.compilerOptions?.baseUrl) {
            return (0, path_1.resolve)(chain[i].dir, chain[i].raw.compilerOptions.baseUrl);
        }
    }
    return pathsIndex >= 0
        ? chain[pathsIndex].dir
        : (0, path_1.dirname)((0, path_1.resolve)(tsconfigPath));
}
/**
 * Resolves a tsconfig `extends` entry to an absolute path.
 * Handles relative paths, absolute paths, and package names
 * (e.g., `@tsconfig/node20/tsconfig.json` or `@tsconfig/strictest`).
 * Mirrors TypeScript's resolution: relative/absolute paths are resolved
 * directly (with `.json` fallback), package names use `require.resolve`
 * with a `tsconfig.json` fallback for bare package names.
 */
function resolveExtendsPath(ext, fromDir) {
    if (ext.startsWith('.') || (0, path_1.isAbsolute)(ext)) {
        let resolved = (0, path_1.resolve)(fromDir, ext);
        if ((0, fs_1.existsSync)(resolved))
            return resolved;
        if (!resolved.endsWith('.json')) {
            resolved += '.json';
            if ((0, fs_1.existsSync)(resolved))
                return resolved;
        }
        return null;
    }
    // Package name — try as-is, then with /tsconfig.json appended
    try {
        return require.resolve(ext, { paths: [fromDir] });
    }
    catch {
        try {
            return require.resolve(`${ext}/tsconfig.json`, { paths: [fromDir] });
        }
        catch {
            return null;
        }
    }
}
function readTsConfigPaths(tsConfig) {
    tsConfig ??= getRootTsConfigPath();
    try {
        let config;
        if (typeof tsConfig === 'string') {
            if (!tsModule) {
                tsModule = (0, ensure_typescript_1.ensureTypescript)();
            }
            const configFile = tsModule.readConfigFile(tsConfig, tsModule.sys.readFile);
            // Stub `readDirectory` to skip the source-file scan — only `paths` is consumed.
            const parseConfigHost = {
                ...tsModule.sys,
                readDirectory: () => [],
            };
            config = tsModule.parseJsonConfigFileContent(configFile.config, parseConfigHost, (0, path_1.dirname)(tsConfig));
        }
        else {
            config = tsConfig;
        }
        return config.options?.paths ?? null;
    }
    catch (e) {
        return null;
    }
}
