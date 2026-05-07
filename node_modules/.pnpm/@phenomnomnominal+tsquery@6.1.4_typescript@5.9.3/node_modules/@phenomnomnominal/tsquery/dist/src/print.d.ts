import type { PrinterOptions } from 'typescript';
import type { Node, SourceFile } from './index';
/**
 * @public
 * Print a given `Node` or `SourceFile` to a string, using the default TypeScript printer.
 *
 * @param source - the `Node` or `SourceFile` to print.
 * @param options - any `PrinterOptions`.
 * @returns the printed code
 */
export declare function print(source: Node | SourceFile, options?: PrinterOptions): string;
