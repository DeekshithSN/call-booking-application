"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
const index_1 = require("./index");
function query(code, selector, scriptKind) {
    return (0, index_1.match)(index_1.ast.ensure(code, scriptKind), index_1.parse.ensure(selector));
}
exports.query = query;
//# sourceMappingURL=query.js.map