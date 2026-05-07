/// <reference types="esquery" />
import { type Node, type Selector } from './index';
/**
 * @public
 * Find AST `Nodes` within a given AST `Node` matching a `Selector`.
 *
 * @param node - the `Node` to be searched. This could be a TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159), or a `Node` from a previous query.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @returns an `Array` of `Nodes` which match the `Selector`.
 */
export declare function match<T extends Node = Node>(node: Node, selector: string | Selector): Array<T>;
