"use strict";
import { readFile } from 'node:fs/promises';
import { createRequire, builtinModules, } from 'node:module';
import { extname, isAbsolute, join } from 'node:path';
import { fileURLToPath, URL, pathToFileURL } from 'node:url';
import debugFactory from 'debug';
import { ResolverFactory } from 'oxc-resolver';
import ts from 'typescript';
// @ts-expect-error
import { readDefaultTsConfig } from '../lib/read-default-tsconfig.js';
// @ts-expect-error
import { compile } from '../lib/register.js';
const debug = debugFactory('@swc-node');
const builtin = new Set(builtinModules);
const tsconfig = readDefaultTsConfig();
tsconfig.module = ts.ModuleKind.ESNext;
const TSCONFIG_PATH = (function () {
    var _a, _b;
    const pathFromEnv = (_b = (_a = process.env.SWC_NODE_PROJECT) !== null && _a !== void 0 ? _a : process.env.TS_NODE_PROJECT) !== null && _b !== void 0 ? _b : join(process.cwd(), 'tsconfig.json');
    if (!isAbsolute(pathFromEnv)) {
        return join(process.cwd(), pathFromEnv);
    }
    return pathFromEnv;
})();
async function getModuleType(path) {
    const pkgJsonReadContent = await readPackageJSON(path);
    return pkgJsonReadContent === null || pkgJsonReadContent === void 0 ? void 0 : pkgJsonReadContent.type;
}
const addShortCircuitSignal = (input) => {
    return {
        ...input,
        shortCircuit: true,
    };
};
const packageJSONCache = new Map();
const readFileIfExists = async (path) => {
    try {
        const content = await readFile(path, 'utf-8');
        return JSON.parse(content);
    }
    catch (e) {
        // eslint-disable-next-line no-undef
        if (e.code === 'ENOENT') {
            return undefined;
        }
        throw e;
    }
};
const readPackageJSON = async (path) => {
    if (packageJSONCache.has(path)) {
        return packageJSONCache.get(path);
    }
    const res = (await readFileIfExists(path));
    packageJSONCache.set(path, res);
    return res;
};
const getPackageForFile = async (url) => {
    // use URL instead path.resolve to handle relative path
    let packageJsonURL = new URL('./package.json', url);
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const path = fileURLToPath(packageJsonURL);
        // for special case by some package manager
        if (path.endsWith('node_modules/package.json')) {
            break;
        }
        const packageJson = await readPackageJSON(path);
        if (!packageJson) {
            const lastPath = packageJsonURL.pathname;
            packageJsonURL = new URL('../package.json', packageJsonURL);
            // root level /package.json
            if (packageJsonURL.pathname === lastPath) {
                break;
            }
            continue;
        }
        if (packageJson.type && packageJson.type !== 'module' && packageJson.type !== 'commonjs') {
            packageJson.type = undefined;
        }
        return packageJson;
    }
    return undefined;
};
export const getPackageType = async (url) => {
    var _a;
    const packageJson = await getPackageForFile(url);
    return (_a = packageJson === null || packageJson === void 0 ? void 0 : packageJson.type) !== null && _a !== void 0 ? _a : undefined;
};
const EXTENSION_MODULE_MAP = {
    '.mjs': 'module',
    '.cjs': 'commonjs',
    '.ts': 'module',
    '.tsx': 'module',
    '.mts': 'module',
    '.cts': 'commonjs',
    '.json': 'json',
    '.wasm': 'wasm',
    '.node': 'commonjs',
};
let conditions = undefined;
const resolverOptions = {
    tsconfig: {
        configFile: TSCONFIG_PATH,
        references: 'auto',
    },
    conditionNames: ['node', 'import'],
    enforceExtension: 0 /* EnforceExtension.Auto */,
    extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts', '.json', '.wasm', '.node'],
    extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
        '.mjs': ['.mts', '.mjs'],
        '.cjs': ['.cts', '.cjs'],
    },
    moduleType: true,
};
let resolver = new ResolverFactory(resolverOptions);
export const resolve = async (specifier, context, nextResolve) => {
    var _a;
    debug('resolve', specifier, JSON.stringify(context));
    if (!conditions) {
        conditions = context.conditions;
        resolver = resolver.cloneWithOptions({
            ...resolverOptions,
            conditionNames: conditions,
        });
    }
    if (specifier.startsWith('node:') || specifier.startsWith('nodejs:')) {
        debug('skip resolve: internal format', specifier);
        return addShortCircuitSignal({
            url: specifier,
            format: 'builtin',
        });
    }
    if (builtin.has(specifier)) {
        debug('skip resolve: internal format', specifier);
        return addShortCircuitSignal({
            url: `node:${specifier}`,
            format: 'builtin',
        });
    }
    if (specifier.startsWith('data:')) {
        debug('skip resolve: data url', specifier);
        return addShortCircuitSignal({
            url: specifier,
        });
    }
    const parsedUrl = parseUrl(specifier);
    // as entrypoint, just return specifier
    if (!context.parentURL || (parsedUrl === null || parsedUrl === void 0 ? void 0 : parsedUrl.protocol) === 'file:') {
        debug('skip resolve: absolute path or entrypoint', specifier);
        let format = null;
        const specifierPath = fileURLToPath(specifier);
        const ext = extname(specifierPath);
        if (ext === '.js') {
            format = (await getPackageType(specifier)) === 'module' ? 'module' : 'commonjs';
        }
        else {
            format = EXTENSION_MODULE_MAP[ext];
        }
        return addShortCircuitSignal({
            url: specifier,
            format,
        });
    }
    // import attributes, support json currently
    if ((_a = context.importAttributes) === null || _a === void 0 ? void 0 : _a.type) {
        debug('skip resolve: import attributes', specifier);
        return addShortCircuitSignal(await nextResolve(specifier));
    }
    const { error, path, moduleType, packageJsonPath } = await resolver.async(join(fileURLToPath(context.parentURL), '..'), specifier.startsWith('file:') ? fileURLToPath(specifier) : specifier);
    if (error) {
        throw new Error(`${error}: ${specifier} cannot be resolved in ${context.parentURL}`);
    }
    // local project file
    if (path && isPathNotInNodeModules(path)) {
        debug('resolved: typescript', specifier, moduleType, path);
        const url = new URL('file://' + join(path));
        const mt = moduleType !== null && moduleType !== void 0 ? moduleType : (packageJsonPath ? await getModuleType(packageJsonPath) : null);
        return addShortCircuitSignal({
            ...context,
            url: url.href,
            format: path.endsWith('cjs') || path.endsWith('cts') || mt === 'commonjs' || !mt
                ? 'commonjs'
                : mt === 'module'
                    ? 'module'
                    : 'commonjs',
        });
    }
    try {
        // files could not resolved by typescript or resolved as dts, fallback to use node resolver
        const res = await nextResolve(specifier);
        debug('resolved: fallback node', specifier, res.url, res.format);
        return addShortCircuitSignal(res);
    }
    catch (resolveError) {
        // fallback to cjs resolve as may import non-esm files
        try {
            const resolution = pathToFileURL(createRequire(process.cwd()).resolve(specifier)).toString();
            debug('resolved: fallback commonjs', specifier, resolution);
            return addShortCircuitSignal({
                format: 'commonjs',
                url: resolution,
            });
        }
        catch (error) {
            debug('resolved by cjs error', specifier, error);
            throw resolveError;
        }
    }
};
const tsconfigForSWCNode = {
    ...tsconfig,
    paths: undefined,
    baseUrl: undefined,
};
export const load = async (url, context, nextLoad) => {
    debug('load', url, JSON.stringify(context));
    if (url.startsWith('data:')) {
        debug('skip load: data url', url);
        return nextLoad(url, context);
    }
    if (url.includes('/node_modules/')) {
        debug('skip load: node_modules', url);
        return nextLoad(url, context);
    }
    if (context.format && ['builtin', 'json', 'wasm'].includes(context.format)) {
        debug('loaded: internal format', url);
        return nextLoad(url, context);
    }
    const { source, format: resolvedFormat } = await nextLoad(url, context);
    if (!source) {
        debug('No source', url, resolvedFormat);
        return {
            source,
            format: resolvedFormat,
        };
    }
    debug('loaded', url, resolvedFormat);
    const code = !source || typeof source === 'string' ? source : Buffer.from(source).toString();
    // url may be essentially an arbitrary string, but fixing the binding module, which currently
    // expects a real file path, to correctly interpret this doesn't have an obvious solution,
    // and would likely be a breaking change anyway. Do a best effort to give a real path
    // like it expects, which at least fixes relative input sourcemap paths.
    const filename = url.startsWith('file:') ? fileURLToPath(url) : url;
    const compiled = await compile(code, filename, tsconfigForSWCNode, true);
    debug('compiled', url, resolvedFormat);
    return addShortCircuitSignal({
        // for lazy: ts-node think format would undefined, actually it should not, keep it as original temporarily
        format: resolvedFormat,
        source: compiled,
    });
};
function isPathNotInNodeModules(path) {
    return ((process.platform !== 'win32' && !path.includes('/node_modules/')) ||
        (process.platform === 'win32' && !path.includes('\\node_modules\\')));
}
const parseUrl = typeof URL.parse === 'function'
    ? URL.parse
    : (url) => {
        try {
            return new URL(url);
        }
        catch (_a) {
            return null;
        }
    };
//# sourceMappingURL=esm.mjs.map