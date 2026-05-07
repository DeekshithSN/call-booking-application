"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _helpers = require("./helpers.js");

// `placeholder` argument is optional. By default, it's "x".
function _default(template, placeholder, parse) {
  if (typeof placeholder === 'function') {
    parse = placeholder;
    placeholder = 'x';
  }

  var placeholdersCountInTemplate = (0, _helpers.count_occurences)(placeholder, template);
  return function (character, value) {
    if (value.length < placeholdersCountInTemplate) {
      return parse(character, value);
    }
  };
}
//# sourceMappingURL=templateParser.js.map