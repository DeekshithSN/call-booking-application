"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitorKeys = exports.adjacent = exports.sibling = void 0;
const traverse_1 = require("../traverse");
function sibling(node, selector, ancestors) {
    return !!(((0, traverse_1.findMatches)(node, selector.right, ancestors) &&
        findSibling(node, ancestors, siblingLeft)) ||
        (selector.left.subject &&
            (0, traverse_1.findMatches)(node, selector.left, ancestors) &&
            findSibling(node, ancestors, siblingRight)));
    function siblingLeft(prop, index) {
        return prop
            .slice(0, index)
            .some((precedingSibling) => (0, traverse_1.findMatches)(precedingSibling, selector.left, ancestors));
    }
    function siblingRight(prop, index) {
        return prop
            .slice(index, prop.length)
            .some((followingSibling) => (0, traverse_1.findMatches)(followingSibling, selector.right, ancestors));
    }
}
exports.sibling = sibling;
function adjacent(node, selector, ancestors) {
    return !!(((0, traverse_1.findMatches)(node, selector.right, ancestors) &&
        findSibling(node, ancestors, adjacentLeft)) ||
        (selector.right.subject &&
            (0, traverse_1.findMatches)(node, selector.left, ancestors) &&
            findSibling(node, ancestors, adjacentRight)));
    function adjacentLeft(prop, index) {
        return index > 0 && (0, traverse_1.findMatches)(prop[index - 1], selector.left, ancestors);
    }
    function adjacentRight(prop, index) {
        return (index < prop.length - 1 &&
            (0, traverse_1.findMatches)(prop[index + 1], selector.right, ancestors));
    }
}
exports.adjacent = adjacent;
function findSibling(node, ancestors, test) {
    const [parent] = ancestors;
    if (!parent) {
        return false;
    }
    const keys = getVisitorKeys(node.parent || null);
    return keys.some((key) => {
        const prop = node.parent[key];
        if (Array.isArray(prop)) {
            const index = prop.indexOf(node);
            if (index === -1) {
                return false;
            }
            return test(prop, index);
        }
        return false;
    });
}
const FILTERED_KEYS = ['parent'];
function getVisitorKeys(node) {
    return node
        ? Object.keys(node)
            .filter((key) => !FILTERED_KEYS.includes(key))
            .filter((key) => {
            const value = node[key];
            return Array.isArray(value) || typeof value === 'object';
        })
        : [];
}
exports.getVisitorKeys = getVisitorKeys;
//# sourceMappingURL=sibling.js.map