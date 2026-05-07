/// <reference types="esquery" />
import type { Node, Selector } from './index';
/**
 * @public
 * Check for `Nodes` within a given `string` of code or AST `Node` matching a `Selector`.
 *
 * @param node - the `Node` to be searched. This could be a TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159), or a `Node` from a previous query.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @returns `true` if the code contains matches for the `Selector`, `false` if not.
 */
export declare function includes(node: Node, selector: string | Selector): boolean;
