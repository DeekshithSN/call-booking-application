"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replace = void 0;
const index_1 = require("./index");
const print_1 = require("./print");
/**
 * @public
 * Transform AST `Nodes` within a given `Node` matching a `Selector`. Can be used to do string-based replacement or removal of parts of the input AST. The updated code will be printed with the TypeScript [`Printer`](https://github.com/microsoft/TypeScript-wiki/blob/main/Using-the-Compiler-API.md#creating-and-printing-a-typescript-ast), so you may need to run your own formatter on any output code.
 *
 * @param node - the `Node` to be searched. This could be a TypeScript [`SourceFile`](https://github.com/microsoft/TypeScript/blob/main/src/services/types.ts#L159), or a Node from a previous selector.
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @param stringTransformer - a function to transform any matched `Nodes`. If `null` is returned, there is no change.  If a new `string` is returned, the original `Node` is replaced.
 * @param scriptKind - the TypeScript [`ScriptKind`](https://github.com/microsoft/TypeScript/blob/main/src/compiler/types.ts#L7305) of the code. Defaults to `ScriptKind.TSX`. Set this to `ScriptKind.TS` if your code uses the `<Type>` syntax for casting.
 * @returns a transformed `Node`.
 */
function replace(source, selector, stringTransformer, scriptKind) {
    const matches = (0, index_1.query)(source, selector, scriptKind);
    const replacements = matches.map((node) => stringTransformer(node));
    const reversedMatches = matches.reverse();
    const reversedReplacements = replacements.reverse();
    let result = source;
    reversedReplacements.forEach((replacement, index) => {
        if (replacement != null) {
            const match = reversedMatches[index];
            const start = result.substring(0, match.getStart());
            const end = result.substring(match.getEnd());
            result = `${start}${replacement}${end}`;
        }
    });
    return (0, print_1.print)((0, index_1.ast)(result, '', scriptKind));
}
exports.replace = replace;
//# sourceMappingURL=replace.js.map