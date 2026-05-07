import type { Selector } from 'esquery';
import type { Node } from 'typescript';
export type Matcher<Selector> = (node: Node, selector: Selector, ancestors: Array<Node>) => boolean;
type Matchers = {
    [Key in Selector['type']]: Matcher<Selector & {
        type: Key;
    }>;
};
export declare const MATCHERS: Matchers;
export {};
