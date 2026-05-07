"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInput = createInput;
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _react2 = _interopRequireDefault(require("input-format/react"));
var _core = require("libphonenumber-js/core");
var _inputValuePrefix = require("./helpers/inputValuePrefix.js");
var _parsePhoneNumberCharacter = _interopRequireDefault(require("./helpers/parsePhoneNumberCharacter.js"));
var _useInputKeyDownHandler = _interopRequireDefault(require("./useInputKeyDownHandler.js"));
var _excluded = ["onKeyDown", "country", "inputFormat", "metadata", "international", "withCountryCallingCode"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function createInput(defaultMetadata) {
  /**
   * `InputSmart` is a "smarter" implementation of a `Component`
   * that can be passed to `<PhoneInput/>`. It parses and formats
   * the user's and maintains the caret's position in the process.
   * The caret positioning is maintained using `input-format` library.
   * Relies on being run in a DOM environment for calling caret positioning functions.
   */
  function InputSmart(_ref, ref) {
    var onKeyDown = _ref.onKeyDown,
      country = _ref.country,
      inputFormat = _ref.inputFormat,
      _ref$metadata = _ref.metadata,
      metadata = _ref$metadata === void 0 ? defaultMetadata : _ref$metadata,
      international = _ref.international,
      withCountryCallingCode = _ref.withCountryCallingCode,
      rest = _objectWithoutProperties(_ref, _excluded);
    var format = (0, _react.useCallback)(function (value) {
      // "As you type" formatter.
      var formatter = new _core.AsYouType(country, metadata);
      var prefix = (0, _inputValuePrefix.getPrefixForFormattingValueAsPhoneNumber)({
        inputFormat: inputFormat,
        country: country,
        metadata: metadata
      });

      // Format the number.
      var text = formatter.input(prefix + value);
      var template = formatter.getTemplate();
      if (prefix) {
        text = (0, _inputValuePrefix.removePrefixFromFormattedPhoneNumber)(text, prefix);
        // `AsYouType.getTemplate()` can be `undefined`.
        if (template) {
          template = (0, _inputValuePrefix.removePrefixFromFormattedPhoneNumber)(template, prefix);
        }
      }
      return {
        text: text,
        template: template
      };
    }, [country, metadata]);
    var _onKeyDown = (0, _useInputKeyDownHandler["default"])({
      onKeyDown: onKeyDown,
      inputFormat: inputFormat
    });
    return /*#__PURE__*/_react["default"].createElement(_react2["default"], _extends({}, rest, {
      ref: ref,
      parse: _parsePhoneNumberCharacter["default"],
      format: format,
      onKeyDown: _onKeyDown
    }));
  }
  InputSmart = /*#__PURE__*/_react["default"].forwardRef(InputSmart);
  InputSmart.propTypes = {
    /**
     * The parsed phone number.
     * "Parsed" not in a sense of "E.164"
     * but rather in a sense of "having only
     * digits and possibly a leading plus character".
     * Examples: `""`, `"+"`, `"+123"`, `"123"`.
     */
    value: _propTypes["default"].string.isRequired,
    /**
     * A function of `value: string`.
     * Updates the `value` property.
     */
    onChange: _propTypes["default"].func.isRequired,
    /**
     * A function of `event: Event`.
     * Handles `keydown` events.
     */
    onKeyDown: _propTypes["default"].func,
    /**
     * A two-letter country code for formatting `value`
     * as a national phone number (e.g. `(800) 555 35 35`).
     * E.g. "US", "RU", etc.
     * If no `country` is passed then `value`
     * is formatted as an international phone number.
     * (e.g. `+7 800 555 35 35`)
     * This property should've been called `defaultCountry`
     * because it only applies when the user inputs a phone number in a national format
     * and is completely ignored when the user inputs a phone number in an international format.
     */
    country: _propTypes["default"].string,
    /**
     * The format that the input field value is being input/output in.
     */
    inputFormat: _propTypes["default"].oneOf(['INTERNATIONAL', 'NATIONAL_PART_OF_INTERNATIONAL', 'NATIONAL', 'INTERNATIONAL_OR_NATIONAL']).isRequired,
    /**
     * `libphonenumber-js` metadata.
     */
    metadata: _propTypes["default"].object
  };
  return InputSmart;
}
var _default = exports["default"] = createInput();
//# sourceMappingURL=InputSmart.js.map