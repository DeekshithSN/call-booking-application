"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.field = void 0;
const utils_1 = require("../utils");
function field(node, selector, ancestors) {
    const path = selector.name.split('.');
    const ancestor = ancestors[path.length - 1];
    return (0, utils_1.inPath)(node, ancestor, path);
}
exports.field = field;
//# sourceMappingURL=field.js.map