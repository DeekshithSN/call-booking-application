import type { Node, SourceFile } from './index';
import { ScriptKind } from './index';
/**
 * @public
 * Parse a string of code into an Abstract Syntax Tree which can then be queried with TSQuery Selectors.
 *
 * @param source - the code that should be parsed into a [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159). A `SourceFile` is the TypeScript implementation of an Abstract Syntax Tree (with extra details).
 * @param fileName - a name (if known) for the `SourceFile`. Defaults to empty string.
 * @param scriptKind - the TypeScript [`ScriptKind`](https://github.com/microsoft/TypeScript/blob/main/src/compiler/types.ts#L7305) of the code. Defaults to `ScriptKind.TSX`. Set this to `ScriptKind.TS` if your code uses the `<Type>` syntax for casting.
 * @returns a TypeScript `SourceFile`.
 */
export declare function ast(source: string, fileName?: string, scriptKind?: ScriptKind): SourceFile;
export declare namespace ast {
    var ensure: {
        (code: string, scriptKind: ScriptKind): Node;
        (code: Node): Node;
    };
}
