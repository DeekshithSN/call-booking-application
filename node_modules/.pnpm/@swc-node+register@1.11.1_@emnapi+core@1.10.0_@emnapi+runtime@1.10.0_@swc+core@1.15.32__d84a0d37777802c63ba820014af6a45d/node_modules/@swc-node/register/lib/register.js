"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = compile;
exports.register = register;
const core_1 = require("@swc-node/core");
const sourcemap_support_1 = require("@swc-node/sourcemap-support");
const pirates_1 = require("pirates");
const ts = __importStar(require("typescript"));
const read_default_tsconfig_1 = require("./read-default-tsconfig");
const DEFAULT_EXTENSIONS = new Set([
    ts.Extension.Js,
    ts.Extension.Ts,
    ts.Extension.Jsx,
    ts.Extension.Tsx,
    ts.Extension.Mjs,
    ts.Extension.Mts,
    ts.Extension.Cjs,
    ts.Extension.Cts,
    '.es6',
    '.es',
]);
const injectInlineSourceMap = ({ filename, code, map, }) => {
    if (map) {
        sourcemap_support_1.SourcemapMap.set(filename, map);
        const base64Map = Buffer.from(map, 'utf8').toString('base64');
        const sourceMapContent = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64Map}`;
        return `${code}\n${sourceMapContent}`;
    }
    return code;
};
function compile(sourcecode, filename, options, async = false) {
    if (sourcecode == null) {
        return;
    }
    if (options && typeof options.fallbackToTs === 'function' && options.fallbackToTs(filename)) {
        delete options.fallbackToTs;
        const { outputText, sourceMapText } = ts.transpileModule(sourcecode, {
            fileName: filename,
            compilerOptions: options,
        });
        return injectInlineSourceMap({ filename, code: outputText, map: sourceMapText });
    }
    let swcRegisterConfig;
    if (process.env.SWCRC) {
        // when SWCRC environment variable is set to true it will use swcrc file
        swcRegisterConfig = {
            swc: {
                swcrc: true,
                configFile: process.env.SWC_CONFIG_FILE
            },
        };
    }
    else {
        swcRegisterConfig = (0, read_default_tsconfig_1.tsCompilerOptionsToSwcConfig)(options, filename);
    }
    if (async) {
        return (0, core_1.transform)(sourcecode, filename, swcRegisterConfig).then(({ code, map }) => {
            return injectInlineSourceMap({ filename, code, map });
        });
    }
    else {
        const { code, map } = (0, core_1.transformSync)(sourcecode, filename, swcRegisterConfig);
        return injectInlineSourceMap({ filename, code, map });
    }
}
function register(options = {}, hookOpts = {}) {
    if (!process.env.SWCRC) {
        options = Object.keys(options).length ? options : (0, read_default_tsconfig_1.readDefaultTsConfig)();
    }
    options.module = ts.ModuleKind.CommonJS;
    (0, sourcemap_support_1.installSourceMapSupport)();
    return (0, pirates_1.addHook)((code, filename) => compile(code, filename, options), {
        exts: Array.from(DEFAULT_EXTENSIONS),
        ...hookOpts,
    });
}
//# sourceMappingURL=register.js.map