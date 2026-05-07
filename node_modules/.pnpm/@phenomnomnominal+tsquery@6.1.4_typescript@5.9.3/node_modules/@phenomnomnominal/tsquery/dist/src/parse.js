"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
const esquery = __importStar(require("esquery"));
const typescript_1 = require("typescript");
const IDENTIFIER_QUERY = 'identifier';
/**
 * @public
 * Parse a `string` into an ESQuery `Selector`.
 *
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @returns a validated `Selector` or `null` if the input `string` is invalid.
 * @throws if the `Selector` is syntactically valid, but contains an invalid TypeScript Node kind.
 */
function parse(selector) {
    const cleanSelector = stripComments(stripNewLines(selector));
    return validate(esquery.parse(cleanSelector));
}
exports.parse = parse;
/**
 * @public
 * Ensure that an input is a parsed ESQuery `Selector`.
 *
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @returns a validated `Selector`
 * @throws if the input `string` is invalid.
 */
parse.ensure = function ensure(selector) {
    if (isSelector(selector)) {
        return selector;
    }
    const parsed = parse(selector);
    if (!parsed) {
        throw new SyntaxError(`"${selector}" is not a valid TSQuery Selector.`);
    }
    return parsed;
};
function isSelector(selector) {
    return typeof selector !== 'string';
}
function stripComments(input) {
    return input.replace(/\/\*[\w\W]*\*\//g, '');
}
function stripNewLines(input) {
    return input.replace(/\n/g, '');
}
function validate(selector) {
    if (!selector) {
        return null;
    }
    const { selectors } = selector;
    if (selectors) {
        selectors.map(validate);
    }
    const { left, right } = selector;
    if (left) {
        validate(left);
    }
    if (right) {
        validate(right);
    }
    if (selector.type === IDENTIFIER_QUERY) {
        const { value } = selector;
        if (typescript_1.SyntaxKind[value] == null) {
            throw new SyntaxError(`"${value}" is not a valid TypeScript Node kind.`);
        }
    }
    return selector;
}
//# sourceMappingURL=parse.js.map