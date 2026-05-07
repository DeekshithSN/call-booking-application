"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = void 0;
const typescript_1 = require("typescript");
const index_1 = require("./index");
/**
 * @public
 * Print a given `Node` or `SourceFile` to a string, using the default TypeScript printer.
 *
 * @param source - the `Node` or `SourceFile` to print.
 * @param options - any `PrinterOptions`.
 * @returns the printed code
 */
function print(source, options = {}) {
    const printer = (0, typescript_1.createPrinter)(Object.assign({ newLine: typescript_1.NewLineKind.LineFeed }, options));
    if (!(0, typescript_1.isSourceFile)(source)) {
        const file = (0, index_1.ast)('');
        deletePos(source);
        return printer.printNode(typescript_1.EmitHint.Unspecified, source, file);
    }
    return printer.printFile(source).trim();
}
exports.print = print;
function deletePos(node) {
    node.pos = -1;
    node.forEachChild(deletePos);
}
//# sourceMappingURL=print.js.map