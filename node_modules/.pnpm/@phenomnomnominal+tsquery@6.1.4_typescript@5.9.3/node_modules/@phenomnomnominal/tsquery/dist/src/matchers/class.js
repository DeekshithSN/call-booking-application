"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classMatcher = void 0;
const traverse_1 = require("../traverse");
const CLASS_MATCHERS = {
    declaration,
    expression,
    function: functionMatcher,
    pattern,
    statement
};
function classMatcher(node, selector, ancestors) {
    const properties = (0, traverse_1.getProperties)(node);
    if (!properties.kindName) {
        return false;
    }
    const matcher = CLASS_MATCHERS[selector.name];
    if (matcher) {
        return matcher(node, properties, selector, ancestors);
    }
    throw new SyntaxError(`Unknown class name: "${selector.name}"`);
}
exports.classMatcher = classMatcher;
function declaration(_, properties) {
    return properties.kindName.endsWith('Declaration');
}
function expression(node, properties) {
    const { kindName } = properties;
    return (kindName.endsWith('Expression') ||
        kindName.endsWith('Literal') ||
        (kindName === 'Identifier' &&
            !!node.parent &&
            (0, traverse_1.getProperties)(node.parent).kindName !== 'MetaProperty') ||
        kindName === 'MetaProperty');
}
function functionMatcher(_, properties) {
    const { kindName } = properties;
    return (kindName.startsWith('Function') ||
        kindName === 'ArrowFunction' ||
        kindName === 'MethodDeclaration');
}
function pattern(node, properties) {
    return (properties.kindName.endsWith('Pattern') || expression(node, properties));
}
function statement(node, properties) {
    return (properties.kindName.endsWith('Statement') || declaration(node, properties));
}
//# sourceMappingURL=class.js.map