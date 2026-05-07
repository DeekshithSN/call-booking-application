"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperties = exports.traverse = exports.findMatches = void 0;
const typescript_1 = require("typescript");
const syntax_kind_1 = require("./syntax-kind");
const matchers_1 = require("./matchers");
const LITERAL_KINDS = [
    typescript_1.SyntaxKind.FalseKeyword,
    typescript_1.SyntaxKind.NoSubstitutionTemplateLiteral,
    typescript_1.SyntaxKind.NullKeyword,
    typescript_1.SyntaxKind.NumericLiteral,
    typescript_1.SyntaxKind.RegularExpressionLiteral,
    typescript_1.SyntaxKind.StringLiteral,
    typescript_1.SyntaxKind.TrueKeyword
];
const PARSERS = {
    [typescript_1.SyntaxKind.FalseKeyword]: () => false,
    [typescript_1.SyntaxKind.NoSubstitutionTemplateLiteral]: (properties) => properties.text,
    [typescript_1.SyntaxKind.NullKeyword]: () => null,
    [typescript_1.SyntaxKind.NumericLiteral]: (properties) => +properties.text,
    [typescript_1.SyntaxKind.RegularExpressionLiteral]: (properties) => new RegExp(properties.text),
    [typescript_1.SyntaxKind.StringLiteral]: (properties) => properties.text,
    [typescript_1.SyntaxKind.TrueKeyword]: () => true
};
function findMatches(node, selector, ancestors = []) {
    const matcher = matchers_1.MATCHERS[selector.type];
    if (matcher) {
        return matcher(node, selector, ancestors);
    }
    throw new SyntaxError(`Unknown selector type: ${selector.type}`);
}
exports.findMatches = findMatches;
function traverse(node, iterator, ancestors = []) {
    if (node.parent != null) {
        ancestors.unshift(node.parent);
    }
    iterator(node, ancestors);
    let children = [];
    try {
        // We need to use `getChildren()` to traverse JSDoc nodes
        children = node.getChildren();
    }
    catch (_a) {
        // but it will fail for synthetic nodes, in which case we fall back:
        node.forEachChild((child) => traverse(child, iterator, ancestors));
    }
    children.forEach((child) => traverse(child, iterator, ancestors));
    ancestors.shift();
}
exports.traverse = traverse;
const propertiesMap = new WeakMap();
function getProperties(node) {
    let properties = propertiesMap.get(node);
    if (!properties) {
        properties = {
            kindName: (0, syntax_kind_1.syntaxKindName)(node.kind),
            text: hasKey(node, 'text') ? node.text : getTextIfNotSynthesized(node)
        };
        if (node.kind === typescript_1.SyntaxKind.Identifier) {
            properties.name = hasKey(node, 'name') ? node.name : properties.text;
        }
        if (LITERAL_KINDS.includes(node.kind)) {
            properties.value = PARSERS[node.kind](properties);
        }
        propertiesMap.set(node, properties);
    }
    return properties;
}
exports.getProperties = getProperties;
function hasKey(node, property) {
    return node[property] != null;
}
function getTextIfNotSynthesized(node) {
    // getText cannot be called on synthesized nodes - those created using
    // TypeScript's createXxx functions - because its implementation relies
    // upon a node's position. See:
    // https://github.com/microsoft/TypeScript/blob/a8bea77d1efe4984e573760770b78486a5488366/src/services/services.ts#L81-L87
    // https://github.com/microsoft/TypeScript/blob/a685ac426c168a9d8734cac69202afc7cb022408/src/compiler/utilities.ts#L8169-L8173
    return !(node.pos >= 0) ? '' : node.getText();
}
//# sourceMappingURL=traverse.js.map