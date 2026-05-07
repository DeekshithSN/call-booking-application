import type { Node, VisitResult } from './index';
export type NodeTransformer = (node: Node) => VisitResult<Node | undefined>;
export type StringTransformer = (node: Node) => string | null;
export type AttributeOperatorType = 'regexp' | 'literal' | 'type';
export type AttributeOperator = (obj: unknown, value: unknown, type: AttributeOperatorType) => boolean;
export type Properties = {
    kindName: string;
    name?: string;
    text: string;
    value?: unknown;
};
