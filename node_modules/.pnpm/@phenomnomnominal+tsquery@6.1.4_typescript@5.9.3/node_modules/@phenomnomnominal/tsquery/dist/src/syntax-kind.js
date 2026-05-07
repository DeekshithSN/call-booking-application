"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syntaxKindName = void 0;
const typescript_1 = require("typescript");
// See https://github.com/Microsoft/TypeScript/issues/18062
// Code inspired by https://github.com/fkling/astexplorer/blob/master/website/src/parsers/js/typescript.js
const SYNTAX_KIND_MAP = {};
for (const name of Object.keys(typescript_1.SyntaxKind).filter((x) => isNaN(parseInt(x, 10)))) {
    const value = typescript_1.SyntaxKind[name];
    if (!SYNTAX_KIND_MAP[value]) {
        SYNTAX_KIND_MAP[value] = name;
    }
}
/**
 * @deprecated Will be removed in v7.
 *
 * @public
 * Transform AST `Nodes` within a given `Node` matching a `Selector`. Can be used to do `Node`-based replacement or removal of parts of the input AST.
 *
 * @param kind - a [`SyntaxKind`](https://github.com/microsoft/TypeScript/blob/main/src/compiler/types.ts#L41) enum value.
 * @returns the name of the `SyntaxKind`.
 */
function syntaxKindName(kind) {
    return SYNTAX_KIND_MAP[kind];
}
exports.syntaxKindName = syntaxKindName;
//# sourceMappingURL=syntax-kind.js.map