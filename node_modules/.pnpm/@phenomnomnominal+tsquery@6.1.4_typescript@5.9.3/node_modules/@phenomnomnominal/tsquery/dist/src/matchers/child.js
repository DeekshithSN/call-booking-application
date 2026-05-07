"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.child = void 0;
const traverse_1 = require("../traverse");
function child(node, selector, ancestors) {
    if ((0, traverse_1.findMatches)(node, selector.right, ancestors)) {
        return (0, traverse_1.findMatches)(ancestors[0], selector.left, ancestors.slice(1));
    }
    return false;
}
exports.child = child;
//# sourceMappingURL=child.js.map