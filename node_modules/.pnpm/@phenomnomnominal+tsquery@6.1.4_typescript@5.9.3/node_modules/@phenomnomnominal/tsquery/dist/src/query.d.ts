/// <reference types="esquery" />
import type { Node, ScriptKind, Selector } from './index';
/**
 * @public
 * Find AST `Nodes` within a given `string` of code or AST `Node` matching a `Selector`.
 *
 * @param code - the code to be searched. This could be a `string` of TypeScript code, a TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159), or a `Node` from a previous query.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @param scriptKind - the TypeScript [`ScriptKind`](https://github.com/microsoft/TypeScript/blob/main/src/compiler/types.ts#L7305) of the code. Only required when passing a `string` of code. Defaults to `ScriptKind.TSX`. Set this to `ScriptKind.TS` if your code uses the `<Type>` syntax for casting.
 * @returns an `Array` of `Nodes` which match the `Selector`.
 */
export declare function query<T extends Node = Node>(code: string, selector: string | Selector, scriptKind?: ScriptKind): Array<T>;
export declare function query<T extends Node = Node>(code: Node, selector: string | Selector): Array<T>;
