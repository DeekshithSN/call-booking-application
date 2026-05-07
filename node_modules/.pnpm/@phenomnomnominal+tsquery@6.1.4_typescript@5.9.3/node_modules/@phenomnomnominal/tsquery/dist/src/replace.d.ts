import type { StringTransformer } from './types';
import { ScriptKind } from './index';
/**
 * @public
 * Transform AST `Nodes` within a given `Node` matching a `Selector`. Can be used to do string-based replacement or removal of parts of the input AST. The updated code will be printed with the TypeScript [`Printer`](https://github.com/microsoft/TypeScript-wiki/blob/main/Using-the-Compiler-API.md#creating-and-printing-a-typescript-ast), so you may need to run your own formatter on any output code.
 *
 * @param node - the `Node` to be searched. This could be a TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159), or a Node from a previous selector.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @param stringTransformer - a function to transform any matched `Nodes`. If `null` is returned, there is no change.  If a new `string` is returned, the original `Node` is replaced.
 * @param scriptKind - the TypeScript [`ScriptKind`](https://github.com/microsoft/TypeScript/blob/main/src/compiler/types.ts#L7305) of the code. Defaults to `ScriptKind.TSX`. Set this to `ScriptKind.TS` if your code uses the `<Type>` syntax for casting.
 * @returns a transformed `Node`.
 */
export declare function replace(source: string, selector: string, stringTransformer: StringTransformer, scriptKind?: ScriptKind): string;
