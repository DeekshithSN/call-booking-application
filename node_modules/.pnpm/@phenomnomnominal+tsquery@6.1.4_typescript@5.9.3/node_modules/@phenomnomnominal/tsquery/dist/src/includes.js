"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includes = void 0;
const index_1 = require("./index");
/**
 * @public
 * Check for `Nodes` within a given `string` of code or AST `Node` matching a `Selector`.
 *
 * @param node - the `Node` to be searched. This could be a TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159), or a `Node` from a previous query.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @returns `true` if the code contains matches for the `Selector`, `false` if not.
 */
function includes(node, selector) {
    return !!(0, index_1.query)(node, selector).length;
}
exports.includes = includes;
//# sourceMappingURL=includes.js.map