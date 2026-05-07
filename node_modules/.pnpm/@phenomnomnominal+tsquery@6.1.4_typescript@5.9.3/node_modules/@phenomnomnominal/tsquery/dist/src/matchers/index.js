"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MATCHERS = void 0;
const attribute_1 = require("./attribute");
const child_1 = require("./child");
const class_1 = require("./class");
const descendant_1 = require("./descendant");
const field_1 = require("./field");
const has_1 = require("./has");
const identifier_1 = require("./identifier");
const matches_1 = require("./matches");
const not_1 = require("./not");
const nth_child_1 = require("./nth-child");
const sibling_1 = require("./sibling");
const type_1 = require("./type");
const wildcard_1 = require("./wildcard");
exports.MATCHERS = {
    adjacent: sibling_1.adjacent,
    attribute: attribute_1.attribute,
    child: child_1.child,
    compound: (0, matches_1.matches)('every'),
    class: class_1.classMatcher,
    descendant: descendant_1.descendant,
    field: field_1.field,
    'nth-child': nth_child_1.nthChild,
    'nth-last-child': nth_child_1.nthLastChild,
    has: has_1.has,
    identifier: identifier_1.identifier,
    matches: (0, matches_1.matches)('some'),
    not: not_1.not,
    sibling: sibling_1.sibling,
    type: type_1.type,
    wildcard: wildcard_1.wildcard
};
//# sourceMappingURL=index.js.map