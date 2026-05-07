var _excluded = ["value", "onChange", "onKeyDown", "country", "inputFormat", "metadata", "inputComponent", "international", "withCountryCallingCode"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { parseIncompletePhoneNumber, formatIncompletePhoneNumber } from 'libphonenumber-js/core';
import { getPrefixForFormattingValueAsPhoneNumber, removePrefixFromFormattedPhoneNumber } from './helpers/inputValuePrefix.js';
import useInputKeyDownHandler from './useInputKeyDownHandler.js';
export function createInput(defaultMetadata) {
  /**
   * `InputBasic` is the most basic implementation of a `Component`
   * that can be passed to `<PhoneInput/>`. It parses and formats
   * the user's input but doesn't control the caret in the process:
   * when erasing or inserting digits in the middle of a phone number
   * the caret usually jumps to the end (this is the expected behavior).
   * Why does `InputBasic` exist when there's `InputSmart`?
   * One reason is working around the [Samsung Galaxy smart caret positioning bug]
   * (https://github.com/catamphetamine/react-phone-number-input/issues/75).
   * Another reason is that, unlike `InputSmart`, it doesn't require DOM environment.
   */
  function InputBasic(_ref, ref) {
    var value = _ref.value,
      onChange = _ref.onChange,
      onKeyDown = _ref.onKeyDown,
      country = _ref.country,
      inputFormat = _ref.inputFormat,
      _ref$metadata = _ref.metadata,
      metadata = _ref$metadata === void 0 ? defaultMetadata : _ref$metadata,
      _ref$inputComponent = _ref.inputComponent,
      Input = _ref$inputComponent === void 0 ? 'input' : _ref$inputComponent,
      international = _ref.international,
      withCountryCallingCode = _ref.withCountryCallingCode,
      rest = _objectWithoutProperties(_ref, _excluded);
    var prefix = getPrefixForFormattingValueAsPhoneNumber({
      inputFormat: inputFormat,
      country: country,
      metadata: metadata
    });
    var _onChange = useCallback(function (event) {
      var newValue = parseIncompletePhoneNumber(event.target.value);
      // By default, if a value is something like `"(123)"`
      // then Backspace would only erase the rightmost brace
      // becoming something like `"(123"`
      // which would give the same `"123"` value
      // which would then be formatted back to `"(123)"`
      // and so a user wouldn't be able to erase the phone number.
      //
      // This issue is worked around with this simple hack:
      // when "old" and "new" parsed values are the same,
      // it checks if the "new" formatted value could be obtained
      // from the "old" formatted value by erasing some (or no) characters at the right side.
      // If it could then it's likely that the user has hit a Backspace key
      // and what they really intended was to erase a rightmost digit rather than
      // a rightmost punctuation character.
      //
      if (newValue === value) {
        var newValueFormatted = format(prefix, newValue, country, metadata);
        if (newValueFormatted.indexOf(event.target.value) === 0) {
          // Trim the last digit (or plus sign).
          newValue = newValue.slice(0, -1);
        }
      }
      onChange(newValue);
    }, [prefix, value, onChange, country, metadata]);
    var _onKeyDown = useInputKeyDownHandler({
      onKeyDown: onKeyDown,
      inputFormat: inputFormat
    });
    return /*#__PURE__*/React.createElement(Input, _extends({}, rest, {
      ref: ref,
      value: format(prefix, value, country, metadata),
      onChange: _onChange,
      onKeyDown: _onKeyDown
    }));
  }
  InputBasic = /*#__PURE__*/React.forwardRef(InputBasic);
  InputBasic.propTypes = {
    /**
     * The parsed phone number.
     * "Parsed" not in a sense of "E.164"
     * but rather in a sense of "having only
     * digits and possibly a leading plus character".
     * Examples: `""`, `"+"`, `"+123"`, `"123"`.
     */
    value: PropTypes.string.isRequired,
    /**
     * A function of `value: string`.
     * Updates the `value` property.
     */
    onChange: PropTypes.func.isRequired,
    /**
     * A function of `event: Event`.
     * Handles `keydown` events.
     */
    onKeyDown: PropTypes.func,
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
    country: PropTypes.string,
    /**
     * The format that the input field value is being input/output in.
     */
    inputFormat: PropTypes.oneOf(['INTERNATIONAL', 'NATIONAL_PART_OF_INTERNATIONAL', 'NATIONAL', 'INTERNATIONAL_OR_NATIONAL']).isRequired,
    /**
     * `libphonenumber-js` metadata.
     */
    metadata: PropTypes.object,
    /**
     * The `<input/>` component.
     */
    inputComponent: PropTypes.elementType
  };
  return InputBasic;
}
export default createInput();
function format(prefix, value, country, metadata) {
  return removePrefixFromFormattedPhoneNumber(formatIncompletePhoneNumber(prefix + value, country, metadata), prefix);
}
//# sourceMappingURL=InputBasic.js.map