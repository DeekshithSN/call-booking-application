"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransformer = exports.map = void 0;
const typescript_1 = require("typescript");
const index_1 = require("./index");
/**
 * @public
 * Transform AST `Nodes` within a given `Node` matching a `Selector`. Can be used to do `Node`-based replacement or removal of parts of the input AST.
 *
 * @param sourceFile - the TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159) to be searched.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @param nodeTransformer - a function to transform any matched `Nodes`. If the original `Node` is returned, there is no change. If a new `Node` is returned, the original `Node` is replaced. If `undefined` is returned, the original `Node` is removed.
 * @returns a transformed `Node`.
 */
function map(sourceFile, selector, nodeTransformer) {
    const matches = (0, index_1.match)(sourceFile, index_1.parse.ensure(selector));
    return mapTransform(sourceFile, matches, nodeTransformer);
}
exports.map = map;
function mapTransform(sourceFile, matches, nodeTransformer) {
    const transformer = createTransformer((node) => {
        if (matches.includes(node)) {
            return nodeTransformer(node);
        }
        return node;
    });
    const [transformed] = (0, typescript_1.transform)(sourceFile, [transformer]).transformed;
    return (0, index_1.ast)((0, index_1.print)(transformed));
}
function createTransformer(nodeTransformer) {
    return function (context) {
        return function (rootNode) {
            function visit(node) {
                const replacement = nodeTransformer(node);
                if (replacement !== node) {
                    return replacement;
                }
                return (0, typescript_1.visitEachChild)(node, visit, context);
            }
            return (0, typescript_1.visitNode)(rootNode, visit) || rootNode;
        };
    };
}
exports.createTransformer = createTransformer;
//# sourceMappingURL=map.js.map