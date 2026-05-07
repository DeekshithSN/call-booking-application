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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = exports.project = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const typescript_1 = require("typescript");
/**
 * @public
 * Get all the `SourceFiles` included in a the TypeScript project described by a given config file.
 *
 * @param configFilePath - the path to the TypeScript config file, or a directory containing a `tsconfig.json` file.
 * @returns an `Array` of the `SourceFiles` for all files in the project.
 */
function project(configFilePath) {
    const fullPath = findConfig(configFilePath);
    if (fullPath) {
        return getSourceFiles(fullPath);
    }
    return [];
}
exports.project = project;
/**
 * @public
 * Get all the file paths included ina the TypeScript project described by a given config file.
 *
 * @param configFilePath - the path to the TypeScript config file, or a directory containing a `tsconfig.json` file.
 * @returns an `Array` of the file paths for all files in the project.
 */
function files(configFilePath) {
    const fullPath = findConfig(configFilePath);
    if (fullPath) {
        return parseConfig(configFilePath).fileNames;
    }
    return [];
}
exports.files = files;
function findConfig(configFilePath) {
    try {
        const fullPath = path.resolve(process.cwd(), configFilePath);
        // Throws if file does not exist:
        const stats = fs.statSync(fullPath);
        if (!stats.isDirectory()) {
            return fullPath;
        }
        const inDirectoryPath = path.join(fullPath, 'tsconfig.json');
        // Throws if file does not exist:
        fs.accessSync(inDirectoryPath);
        return inDirectoryPath;
    }
    catch (e) {
        return null;
    }
}
function getSourceFiles(configFilePath) {
    const parsed = parseConfig(configFilePath);
    const host = (0, typescript_1.createCompilerHost)(parsed.options, true);
    const program = (0, typescript_1.createProgram)(parsed.fileNames, parsed.options, host);
    return Array.from(program.getSourceFiles());
}
function parseConfig(configFilePath) {
    const config = (0, typescript_1.readConfigFile)(configFilePath, typescript_1.sys.readFile.bind(typescript_1.sys));
    const parseConfigHost = {
        fileExists: typescript_1.sys.fileExists.bind(typescript_1.sys),
        readDirectory: typescript_1.sys.readDirectory.bind(typescript_1.sys),
        readFile: typescript_1.sys.readFile.bind(typescript_1.sys),
        useCaseSensitiveFileNames: true
    };
    return (0, typescript_1.parseJsonConfigFileContent)(config.config, parseConfigHost, path.dirname(configFilePath), { noEmit: true });
}
//# sourceMappingURL=project.js.map