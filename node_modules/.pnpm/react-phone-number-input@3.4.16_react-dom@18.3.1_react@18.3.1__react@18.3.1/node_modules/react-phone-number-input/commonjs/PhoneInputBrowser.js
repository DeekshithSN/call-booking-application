"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInput = createInput;
exports["default"] = void 0;
var _react = _interopRequireDefault(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _PhoneInput = _interopRequireDefault(require("./PhoneInput.js"));
var _InputSmart = _interopRequireDefault(require("./InputSmart.js"));
var _InputBasic = _interopRequireDefault(require("./InputBasic.js"));
var _excluded = ["type", "autoComplete", "smartCaret", "metadata"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function createInput(defaultMetadata) {
  function PhoneInput(_ref, ref) {
    var _ref$type = _ref.type,
      type = _ref$type === void 0 ? 'tel' : _ref$type,
      _ref$autoComplete = _ref.autoComplete,
      autoComplete = _ref$autoComplete === void 0 ? 'tel' : _ref$autoComplete,
      _ref$smartCaret = _ref.smartCaret,
      smartCaret = _ref$smartCaret === void 0 ? true : _ref$smartCaret,
      _ref$metadata = _ref.metadata,
      metadata = _ref$metadata === void 0 ? defaultMetadata : _ref$metadata,
      rest = _objectWithoutProperties(_ref, _excluded);
    return /*#__PURE__*/_react["default"].createElement(_PhoneInput["default"], _extends({}, rest, {
      type: type,
      autoComplete: autoComplete,
      metadata: metadata,
      ref: ref,
      Component: smartCaret ? _InputSmart["default"] : _InputBasic["default"]
    }));
  }
  PhoneInput = /*#__PURE__*/_react["default"].forwardRef(PhoneInput);
  PhoneInput.propTypes = {
    /**
     * HTML `<input/>` `type` attribute.
     */
    type: _propTypes["default"].string,
    /**
     * HTML `<input/>` `autocomplete` attribute.
     */
    autoComplete: _propTypes["default"].string,
    /**
     * By default, the caret position is being "intelligently" managed
     * while a user inputs a phone number.
     * This "smart" caret behavior can be turned off
     * by passing `smartCaret={false}` property.
     * This is just an "escape hatch" for any possible caret position issues.
     */
    // Is `true` by default.
    smartCaret: _propTypes["default"].bool,
    /**
     * `libphonenumber-js` metadata.
     */
    metadata: _propTypes["default"].object
  };
  return PhoneInput;
}
var _default = exports["default"] = createInput();
//# sourceMappingURL=PhoneInputBrowser.js.map