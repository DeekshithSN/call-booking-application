import { SourceFile } from './index';
/**
 * @public
 * Get all the `SourceFiles` included in a the TypeScript project described by a given config file.
 *
 * @param configFilePath - the path to the TypeScript config file, or a directory containing a `tsconfig.json` file.
 * @returns an `Array` of the `SourceFiles` for all files in the project.
 */
export declare function project(configFilePath: string): Array<SourceFile>;
/**
 * @public
 * Get all the file paths included ina the TypeScript project described by a given config file.
 *
 * @param configFilePath - the path to the TypeScript config file, or a directory containing a `tsconfig.json` file.
 * @returns an `Array` of the file paths for all files in the project.
 */
export declare function files(configFilePath: string): Array<string>;
