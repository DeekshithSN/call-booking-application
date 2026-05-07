"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.match = void 0;
const index_1 = require("./index");
const traverse_1 = require("./traverse");
/**
 * @public
 * Find AST `Nodes` within a given AST `Node` matching a `Selector`.
 *
 * @param node - the `Node` to be searched. This could be a TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159), or a `Node` from a previous query.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @returns an `Array` of `Nodes` which match the `Selector`.
 */
function match(node, selector) {
    const results = [];
    const parsedSelector = index_1.parse.ensure(selector);
    (0, traverse_1.traverse)(node, (childNode, ancestry) => {
        if ((0, traverse_1.findMatches)(childNode, parsedSelector, ancestry)) {
            results.push(childNode);
        }
    });
    return results;
}
exports.match = match;
//# sourceMappingURL=match.js.map