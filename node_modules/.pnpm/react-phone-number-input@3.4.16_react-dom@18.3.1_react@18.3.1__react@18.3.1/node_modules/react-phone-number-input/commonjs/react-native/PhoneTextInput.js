"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _reactNative = require("react-native");
var _excluded = ["onChange", "autoCompleteType", "TextInputComponent"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
/**
 * This is an _experimental_ React Native component.
 * Feedback thread: https://github.com/catamphetamine/react-phone-number-input/issues/296
 */
function PhoneTextInput(_ref, ref) {
  var onChange = _ref.onChange,
    _ref$autoCompleteType = _ref.autoCompleteType,
    autoCompleteType = _ref$autoCompleteType === void 0 ? 'tel' : _ref$autoCompleteType,
    _ref$TextInputCompone = _ref.TextInputComponent,
    TextInputComponent = _ref$TextInputCompone === void 0 ? _reactNative.TextInput : _ref$TextInputCompone,
    rest = _objectWithoutProperties(_ref, _excluded);
  // Instead of `onChangeText(value: string)` it could use
  // `onChange(nativeEvent: Event)` and get `value` from `nativeEvent.text`.
  var onChangeText = (0, _react.useCallback)(function (value) {
    onChange({
      preventDefault: function preventDefault() {
        this.defaultPrevented = true;
      },
      target: {
        value: value
      }
    });
  }, [onChange]);

  // React Native `<TextInput/>` supports properties:
  // * `placeholder: string?`
  // * `autoFocus: boolean?`
  // * `value: string?`
  // plus the ones mentioned below:
  return /*#__PURE__*/_react["default"].createElement(TextInputComponent, _extends({
    ref: ref,
    autoCompleteType: autoCompleteType,
    keyboardType: "phone-pad",
    onChangeText: onChangeText
  }, rest));
}
PhoneTextInput = /*#__PURE__*/_react["default"].forwardRef(PhoneTextInput);
PhoneTextInput.propTypes = {
  /**
   * The input field `value: string`.
   */
  value: _propTypes["default"].string,
  /**
   * A function of `event: Event`.
   * Updates the `value: string` property.
   */
  onChange: _propTypes["default"].func.isRequired,
  /**
   * The standard `autoCompleteType` property of a React Native `<TextInput/>`.
   */
  autoCompleteType: _propTypes["default"].string,
  /**
   * The input field component.
   */
  TextInputComponent: _propTypes["default"].elementType
};
var _default = exports["default"] = PhoneTextInput;
//# sourceMappingURL=PhoneTextInput.js.map