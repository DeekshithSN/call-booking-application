import type { MultiSelector } from 'esquery';
import type { Node } from 'typescript';
export declare function matches<Selector extends MultiSelector>(modifier: 'some' | 'every'): (node: Node, selector: Selector, ancestors: Array<Node>) => boolean;
