"use strict";

var _mocha = require("mocha");

var _chai = require("chai");

var _hasFlag = _interopRequireDefault(require("./hasFlag.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

(0, _mocha.describe)('hasFlag', function () {
  (0, _mocha.it)('should return whether a flag icon exists', function () {
    (0, _chai.expect)((0, _hasFlag["default"])('RU')).to.equal(true);
    (0, _chai.expect)((0, _hasFlag["default"])('ZZ')).to.equal(false);
  });
});
//# sourceMappingURL=hasFlag.test.js.map