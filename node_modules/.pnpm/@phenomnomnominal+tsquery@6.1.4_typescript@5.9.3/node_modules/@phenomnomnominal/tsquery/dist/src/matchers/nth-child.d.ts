import type { SubjectSelector } from 'esquery';
import type { Node } from 'typescript';
export declare function nthChild(node: Node, selector: SubjectSelector, ancestors: Array<Node>): boolean;
export declare function nthLastChild(node: Node, selector: SubjectSelector, ancestors: Array<Node>): boolean;
