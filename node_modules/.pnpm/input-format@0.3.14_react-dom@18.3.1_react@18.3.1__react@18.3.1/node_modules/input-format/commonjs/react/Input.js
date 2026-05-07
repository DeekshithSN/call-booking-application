"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _useInput = _interopRequireDefault(require("./useInput.js"));

var _excluded = ["inputComponent", "parse", "format", "value", "defaultValue", "onChange", "controlled", "onKeyDown", "type"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

// Usage:
//
// <ReactInput
// 	value={this.state.phone}
// 	onChange={phone => this.setState({ phone })}
// 	parse={character => character}
// 	format={value => ({ text: value, template: 'xxxxxxxx' })}/>
//
function Input(_ref, ref) {
  var _ref$inputComponent = _ref.inputComponent,
      InputComponent = _ref$inputComponent === void 0 ? 'input' : _ref$inputComponent,
      parse = _ref.parse,
      format = _ref.format,
      value = _ref.value,
      defaultValue = _ref.defaultValue,
      onChange = _ref.onChange,
      controlled = _ref.controlled,
      onKeyDown = _ref.onKeyDown,
      _ref$type = _ref.type,
      type = _ref$type === void 0 ? 'text' : _ref$type,
      rest = _objectWithoutProperties(_ref, _excluded);

  var inputProps = (0, _useInput["default"])(_objectSpread({
    ref: ref,
    parse: parse,
    format: format,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    controlled: controlled,
    onKeyDown: onKeyDown,
    type: type
  }, rest));
  return /*#__PURE__*/_react["default"].createElement(InputComponent, inputProps);
}

Input = /*#__PURE__*/_react["default"].forwardRef(Input);
Input.propTypes = {
  // Parses a single characher of `<input/>` text.
  parse: _propTypes["default"].func.isRequired,
  // Formats `value` into `<input/>` text.
  format: _propTypes["default"].func.isRequired,
  // Renders `<input/>` by default.
  inputComponent: _propTypes["default"].elementType,
  // `<input/>` `type` attribute.
  type: _propTypes["default"].string,
  // Is parsed from <input/> text.
  value: _propTypes["default"].string,
  // An initial value for an "uncontrolled" <input/>.
  defaultValue: _propTypes["default"].string,
  // This handler is called each time `<input/>` text is changed.
  onChange: _propTypes["default"].func,
  // Whether this input should be "controlled" or "uncontrolled".
  // The default value is `true` meaning "uncontrolled".
  controlled: _propTypes["default"].bool,
  // Passthrough
  onKeyDown: _propTypes["default"].func,
  onCut: _propTypes["default"].func,
  onPaste: _propTypes["default"].func
};
var _default = Input;
exports["default"] = _default;
//# sourceMappingURL=Input.js.map