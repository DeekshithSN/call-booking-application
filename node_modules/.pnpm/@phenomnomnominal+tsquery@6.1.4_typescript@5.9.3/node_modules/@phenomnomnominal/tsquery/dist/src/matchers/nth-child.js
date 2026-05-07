"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nthLastChild = exports.nthChild = void 0;
const traverse_1 = require("../traverse");
const sibling_1 = require("./sibling");
function nthChild(node, selector, ancestors) {
    const { right } = selector;
    if (right && !(0, traverse_1.findMatches)(node, right, ancestors)) {
        return false;
    }
    return findNthChild(node, () => selector.index.value - 1);
}
exports.nthChild = nthChild;
function nthLastChild(node, selector, ancestors) {
    const { right } = selector;
    if (right && !(0, traverse_1.findMatches)(node, right, ancestors)) {
        return false;
    }
    return findNthChild(node, (length) => length - selector.index.value);
}
exports.nthLastChild = nthLastChild;
function findNthChild(node, getIndex) {
    if (!node.parent) {
        return false;
    }
    const keys = (0, sibling_1.getVisitorKeys)(node.parent || null);
    return keys.some((key) => {
        const prop = node.parent[key];
        if (Array.isArray(prop)) {
            const index = prop.indexOf(node);
            return index >= 0 && index === getIndex(prop.length);
        }
        return false;
    });
}
//# sourceMappingURL=nth-child.js.map