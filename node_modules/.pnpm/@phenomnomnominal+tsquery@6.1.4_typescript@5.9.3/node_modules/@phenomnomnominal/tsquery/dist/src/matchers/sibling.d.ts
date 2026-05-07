import type { Adjacent, Sibling } from 'esquery';
import type { Node } from 'typescript';
export declare function sibling(node: Node, selector: Sibling, ancestors: Array<Node>): boolean;
export declare function adjacent(node: Node, selector: Adjacent, ancestors: Array<Node>): boolean;
export declare function getVisitorKeys(node: Node | null): Array<string>;
