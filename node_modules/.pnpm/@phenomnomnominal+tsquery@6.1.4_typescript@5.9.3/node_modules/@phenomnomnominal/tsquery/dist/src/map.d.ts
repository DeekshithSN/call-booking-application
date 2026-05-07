/// <reference types="esquery" />
import type { SourceFile, TransformerFactory } from 'typescript';
import type { Node, NodeTransformer, Selector } from './index';
/**
 * @public
 * Transform AST `Nodes` within a given `Node` matching a `Selector`. Can be used to do `Node`-based replacement or removal of parts of the input AST.
 *
 * @param sourceFile - the TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159) to be searched.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @param nodeTransformer - a function to transform any matched `Nodes`. If the original `Node` is returned, there is no change. If a new `Node` is returned, the original `Node` is replaced. If `undefined` is returned, the original `Node` is removed.
 * @returns a transformed `Node`.
 */
export declare function map(sourceFile: SourceFile, selector: string | Selector, nodeTransformer: NodeTransformer): SourceFile;
export declare function createTransformer(nodeTransformer: NodeTransformer): TransformerFactory<Node>;
