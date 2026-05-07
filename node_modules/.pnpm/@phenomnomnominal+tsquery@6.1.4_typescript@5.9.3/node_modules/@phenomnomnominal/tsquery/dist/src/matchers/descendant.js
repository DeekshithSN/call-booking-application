"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.descendant = void 0;
const traverse_1 = require("../traverse");
function descendant(node, selector, ancestors) {
    if ((0, traverse_1.findMatches)(node, selector.right, ancestors)) {
        return ancestors.some((ancestor, index) => (0, traverse_1.findMatches)(ancestor, selector.left, ancestors.slice(index + 1)));
    }
    return false;
}
exports.descendant = descendant;
//# sourceMappingURL=descendant.js.map