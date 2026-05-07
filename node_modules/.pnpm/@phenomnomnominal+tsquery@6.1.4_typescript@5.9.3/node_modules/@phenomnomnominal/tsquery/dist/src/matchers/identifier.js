"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifier = void 0;
const syntax_kind_1 = require("../syntax-kind");
function identifier(node, selector) {
    const name = (0, syntax_kind_1.syntaxKindName)(node.kind);
    return !!name && name.toLowerCase() === selector.value.toLowerCase();
}
exports.identifier = identifier;
//# sourceMappingURL=identifier.js.map