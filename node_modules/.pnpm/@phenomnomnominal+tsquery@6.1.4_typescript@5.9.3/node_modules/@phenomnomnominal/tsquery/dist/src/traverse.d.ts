/// <reference types="esquery" />
import type { Node, Selector } from './index';
import type { Properties } from './types';
export declare function findMatches(node: Node, selector: Selector, ancestors?: Array<Node>): boolean;
export declare function traverse(node: Node, iterator: (node: Node, ancestors: Array<Node>) => void, ancestors?: Array<Node>): void;
export declare function getProperties(node: Node): Properties;
