"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.has = void 0;
const traverse_1 = require("../traverse");
function has(node, selector) {
    const collector = [];
    selector.selectors.forEach((childSelector) => {
        (0, traverse_1.traverse)(node, (childNode, ancestors) => {
            if ((0, traverse_1.findMatches)(childNode, childSelector, ancestors)) {
                collector.push(childNode);
            }
        });
    });
    return collector.length > 0;
}
exports.has = has;
//# sourceMappingURL=has.js.map