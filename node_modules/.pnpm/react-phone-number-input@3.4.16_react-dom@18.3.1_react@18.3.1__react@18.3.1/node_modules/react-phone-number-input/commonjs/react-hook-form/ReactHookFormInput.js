"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactHookForm = require("react-hook-form");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useExternalRef3 = _interopRequireDefault(require("../useExternalRef.js"));
var _excluded = ["Component", "name", "defaultValue", "shouldUnregister", "control", "rules", "onChange", "onBlur"],
  _excluded2 = ["ref", "onChange", "onBlur"];
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
var ReactHookFormInput = function ReactHookFormInput(_ref, externalRef) {
  var Component = _ref.Component,
    name = _ref.name,
    defaultValue = _ref.defaultValue,
    shouldUnregister = _ref.shouldUnregister,
    control = _ref.control,
    rules = _ref.rules,
    onChange_ = _ref.onChange,
    onBlur_ = _ref.onBlur,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useExternalRef = (0, _useExternalRef3["default"])(externalRef),
    _useExternalRef2 = _slicedToArray(_useExternalRef, 2),
    internalRef = _useExternalRef2[0],
    refPassthrough = _useExternalRef2[1];

  // `feact-hook-form` doesn't know how to properly handle `undefined` values.
  // https://github.com/react-hook-form/react-hook-form/issues/2990
  defaultValue = defaultValue === undefined ? null : defaultValue;
  var renderInputComponent = function renderInputComponent(_ref2) {
    var ref = _ref2.ref,
      onChange = _ref2.onChange,
      onBlur = _ref2.onBlur,
      restReactHookFormControlledFieldProps = _objectWithoutProperties(_ref2, _excluded2);
    // Setting `ref` passed by `react-hook-form` results in a bug:
    // when an initial value is defined (example: "+78005553535")
    // it seems to be set directly on the `ref`d `<input/>`
    // by `react-hook-form` and the result is a non-formatted
    // "+78005553535" initial value in the `<input/>`.
    //
    // To work around that bug, a fake `ref` is assigned,
    // so that it could only `.focus()` it and no more.
    //
    // `useImperativeHandle()` hook seems to allow `ref` being `undefined`.
    //
    // if (ref) {
    (0, _react.useImperativeHandle)(ref, function () {
      return {
        focus: function focus() {
          internalRef.current.focus();
        }
      };
    });
    // }

    // This function may not work correctly when `defaultValues` are set for the input
    // and the user clears the input value manually: the default value may re-appear as a result.
    // https://github.com/catamphetamine/react-phone-number-input/issues/405#issuecomment-1295885201
    var onChangeCombined = (0, _react.useCallback)(function (value) {
      // `react-hook-form` doesn't know how to properly handle `undefined` values.
      // https://github.com/react-hook-form/react-hook-form/issues/2990
      if (value === undefined) {
        value = null;
      }
      onChange(value);
      if (onChange_) {
        onChange_(value);
      }
    }, [onChange, onChange_]);
    var onBlurCombined = (0, _react.useCallback)(function (event) {
      onBlur(event);
      if (onBlur_) {
        onBlur_(event);
      }
    }, [onBlur, onBlur_]);
    return /*#__PURE__*/_react["default"].createElement(Component, _extends({}, rest, restReactHookFormControlledFieldProps, {
      ref: refPassthrough,
      onChange: onChangeCombined,
      onBlur: onBlurCombined
    }));
  };

  // `react-hook-form@7` no longer accepts `onFocus` property.
  // Since this component can be used with both `v6` and `v7`,
  // the `onFocus` property is left here.
  var onFocus = (0, _react.useCallback)(function () {
    // internalRef.current.disabled = false
    internalRef.current.focus();
  }, []);
  return /*#__PURE__*/_react["default"].createElement(_reactHookForm.Controller, {
    control: control,
    name: name,
    defaultValue: defaultValue,
    shouldUnregister: shouldUnregister,
    rules: rules,
    onFocus: onFocus,
    render: function render(props) {
      // Differentiate between `react-hook-form@6` and `react-hook-form@7`.
      // https://react-hook-form.com/migrate-v6-to-v7/
      // https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/57
      // `props` (before v7) and `props.fields` (in v7) contain properties like:
      // `ref`, `name`, `value`, `onChange`, `onBlur`.
      // https://github.com/react-hook-form/react-hook-form/blob/b0e6c3057ac12a7b12d5616aecf3791acb7d7204/src/types/controller.ts#L21-L30
      return renderInputComponent(props.field || props);
    }
  });
};
ReactHookFormInput = /*#__PURE__*/_react["default"].forwardRef(ReactHookFormInput);
ReactHookFormInput.propTypes = {
  Component: _propTypes["default"].elementType.isRequired,
  name: _propTypes["default"].string.isRequired,
  defaultValue: _propTypes["default"].string,
  // A quote from `react-hook-form`:
  // Without `shouldUnregister: true`, an input value would be retained when input is removed.
  // Setting `shouldUnregister: true` makes the form behave more closer to native.
  shouldUnregister: _propTypes["default"].bool,
  // A developer should pass a `control` object that is returned from `useForm()` hook.
  // Not required when using `<FormProvider/>`.
  control: _propTypes["default"].object,
  rules: _propTypes["default"].object,
  onChange: _propTypes["default"].func,
  onBlur: _propTypes["default"].func
};
var _default = exports["default"] = ReactHookFormInput;
//# sourceMappingURL=ReactHookFormInput.js.map