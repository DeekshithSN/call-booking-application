"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.metadata = exports.labels = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var metadata = exports.metadata = _propTypes["default"].shape({
  country_calling_codes: _propTypes["default"].object.isRequired,
  countries: _propTypes["default"].object.isRequired
});
var labels = exports.labels = _propTypes["default"].objectOf(_propTypes["default"].string);
//# sourceMappingURL=PropTypes.js.map