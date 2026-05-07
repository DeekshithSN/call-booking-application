var _excluded = ["onChange", "autoCompleteType", "TextInputComponent"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'react-native';

/**
 * This is an _experimental_ React Native component.
 * Feedback thread: https://github.com/catamphetamine/react-phone-number-input/issues/296
 */
function PhoneTextInput(_ref, ref) {
  var onChange = _ref.onChange,
    _ref$autoCompleteType = _ref.autoCompleteType,
    autoCompleteType = _ref$autoCompleteType === void 0 ? 'tel' : _ref$autoCompleteType,
    _ref$TextInputCompone = _ref.TextInputComponent,
    TextInputComponent = _ref$TextInputCompone === void 0 ? TextInput : _ref$TextInputCompone,
    rest = _objectWithoutProperties(_ref, _excluded);
  // Instead of `onChangeText(value: string)` it could use
  // `onChange(nativeEvent: Event)` and get `value` from `nativeEvent.text`.
  var onChangeText = useCallback(function (value) {
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
  return /*#__PURE__*/React.createElement(TextInputComponent, _extends({
    ref: ref,
    autoCompleteType: autoCompleteType,
    keyboardType: "phone-pad",
    onChangeText: onChangeText
  }, rest));
}
PhoneTextInput = /*#__PURE__*/React.forwardRef(PhoneTextInput);
PhoneTextInput.propTypes = {
  /**
   * The input field `value: string`.
   */
  value: PropTypes.string,
  /**
   * A function of `event: Event`.
   * Updates the `value: string` property.
   */
  onChange: PropTypes.func.isRequired,
  /**
   * The standard `autoCompleteType` property of a React Native `<TextInput/>`.
   */
  autoCompleteType: PropTypes.string,
  /**
   * The input field component.
   */
  TextInputComponent: PropTypes.elementType
};
export default PhoneTextInput;
//# sourceMappingURL=PhoneTextInput.js.map