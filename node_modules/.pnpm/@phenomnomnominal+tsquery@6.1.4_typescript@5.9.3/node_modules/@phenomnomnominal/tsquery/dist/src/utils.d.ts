import type { Node } from 'typescript';
export declare function getPath(obj: unknown, path: string): unknown;
export declare function isNode(node: unknown): node is Node;
export declare function inPath(node: Node, ancestor: unknown, path: Array<string>): boolean;
