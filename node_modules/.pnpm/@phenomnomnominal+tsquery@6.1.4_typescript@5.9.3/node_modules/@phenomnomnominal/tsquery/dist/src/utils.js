"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inPath = exports.isNode = exports.getPath = void 0;
const traverse_1 = require("./traverse");
function getPath(obj, path) {
    const keys = path.split('.');
    for (const key of keys) {
        if (obj == null) {
            return obj;
        }
        const properties = isNode(obj) ? (0, traverse_1.getProperties)(obj) : {};
        obj =
            key in properties
                ? properties[key]
                : obj[key];
    }
    return obj;
}
exports.getPath = getPath;
function isNode(node) {
    return !!node.getSourceFile;
}
exports.isNode = isNode;
function inPath(node, ancestor, path) {
    if (path.length === 0) {
        return node === ancestor;
    }
    if (ancestor == null) {
        return false;
    }
    const [first] = path;
    const field = ancestor[first];
    const remainingPath = path.slice(1);
    if (Array.isArray(field)) {
        return field.some((item) => inPath(node, item, remainingPath));
    }
    else {
        return inPath(node, field, remainingPath);
    }
}
exports.inPath = inPath;
//# sourceMappingURL=utils.js.map