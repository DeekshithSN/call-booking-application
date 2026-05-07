"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matches = void 0;
const traverse_1 = require("../traverse");
function matches(modifier) {
    return function (node, selector, ancestors) {
        return selector.selectors[modifier]((childSelector) => (0, traverse_1.findMatches)(node, childSelector, ancestors));
    };
}
exports.matches = matches;
//# sourceMappingURL=matches.js.map