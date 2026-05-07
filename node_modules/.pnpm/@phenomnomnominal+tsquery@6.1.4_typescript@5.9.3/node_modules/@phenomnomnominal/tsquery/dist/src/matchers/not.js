"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.not = void 0;
const traverse_1 = require("../traverse");
function not(node, selector, ancestors) {
    return !selector.selectors.some((childSelector) => (0, traverse_1.findMatches)(node, childSelector, ancestors));
}
exports.not = not;
//# sourceMappingURL=not.js.map