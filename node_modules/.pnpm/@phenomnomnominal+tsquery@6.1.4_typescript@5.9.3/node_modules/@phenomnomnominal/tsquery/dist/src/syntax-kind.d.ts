import { SyntaxKind } from 'typescript';
/**
 * @deprecated Will be removed in v7.
 *
 * @public
 * Transform AST `Nodes` within a given `Node` matching a `Selector`. Can be used to do `Node`-based replacement or removal of parts of the input AST.
 *
 * @param kind - a [`SyntaxKind`](https://github.com/microsoft/TypeScript/blob/main/src/compiler/types.ts#L41) enum value.
 * @returns the name of the `SyntaxKind`.
 */
export declare function syntaxKindName(kind: SyntaxKind): string;
