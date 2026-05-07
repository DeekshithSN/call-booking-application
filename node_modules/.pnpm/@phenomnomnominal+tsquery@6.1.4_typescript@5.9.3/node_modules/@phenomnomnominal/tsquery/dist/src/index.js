"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsquery = exports.files = exports.project = exports.replace = exports.map = exports.parse = exports.query = exports.match = exports.includes = exports.print = exports.ast = exports.SyntaxKind = exports.ScriptKind = void 0;
const ast_1 = require("./ast");
const map_1 = require("./map");
const match_1 = require("./match");
const parse_1 = require("./parse");
const project_1 = require("./project");
const query_1 = require("./query");
const replace_1 = require("./replace");
const syntax_kind_1 = require("./syntax-kind");
var typescript_1 = require("typescript");
Object.defineProperty(exports, "ScriptKind", { enumerable: true, get: function () { return typescript_1.ScriptKind; } });
Object.defineProperty(exports, "SyntaxKind", { enumerable: true, get: function () { return typescript_1.SyntaxKind; } });
var ast_2 = require("./ast");
Object.defineProperty(exports, "ast", { enumerable: true, get: function () { return ast_2.ast; } });
var print_1 = require("./print");
Object.defineProperty(exports, "print", { enumerable: true, get: function () { return print_1.print; } });
var includes_1 = require("./includes");
Object.defineProperty(exports, "includes", { enumerable: true, get: function () { return includes_1.includes; } });
var match_2 = require("./match");
Object.defineProperty(exports, "match", { enumerable: true, get: function () { return match_2.match; } });
var query_2 = require("./query");
Object.defineProperty(exports, "query", { enumerable: true, get: function () { return query_2.query; } });
var parse_2 = require("./parse");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parse_2.parse; } });
var map_2 = require("./map");
Object.defineProperty(exports, "map", { enumerable: true, get: function () { return map_2.map; } });
var replace_2 = require("./replace");
Object.defineProperty(exports, "replace", { enumerable: true, get: function () { return replace_2.replace; } });
var project_2 = require("./project");
Object.defineProperty(exports, "project", { enumerable: true, get: function () { return project_2.project; } });
Object.defineProperty(exports, "files", { enumerable: true, get: function () { return project_2.files; } });
/**
 * @deprecated Will be removed in v7. Use the directly exported functions instead:
 *
 * ```
 * // Use:
 * import { ast } from '@phenomnomnominal/tsquery';
 * ast('1 + 1')
 *
 * // Don't use:
 * import { tsquery } from '@phenomnomnominal/tsquery';
 * tsquery.ast('1 + 1')
 * ```
 */
const api = query_1.query;
api.ast = ast_1.ast;
api.map = map_1.map;
api.match = match_1.match;
api.parse = parse_1.parse;
api.project = project_1.project;
api.projectFiles = project_1.files;
api.query = query_1.query;
api.replace = replace_1.replace;
api.syntaxKindName = syntax_kind_1.syntaxKindName;
exports.tsquery = api;
//# sourceMappingURL=index.js.map