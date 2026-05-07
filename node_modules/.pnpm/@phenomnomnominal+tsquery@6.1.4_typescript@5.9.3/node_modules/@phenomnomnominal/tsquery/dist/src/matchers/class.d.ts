import type { Class, Selector } from 'esquery';
import type { Node } from 'typescript';
import type { Properties } from '../types';
type ClassMatcher = (node: Node, properties: Properties, selector: Selector, ancestors: Array<Node>) => boolean;
export type ClassMatchers = {
    [Key in Class['name']]: ClassMatcher;
};
export declare function classMatcher(node: Node, selector: Class, ancestors: Array<Node>): boolean;
export {};
