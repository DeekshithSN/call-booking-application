var _excluded = ["onKeyDown", "country", "inputFormat", "metadata", "international", "withCountryCallingCode"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Input from 'input-format/react';
import { AsYouType } from 'libphonenumber-js/core';
import { getPrefixForFormattingValueAsPhoneNumber, removePrefixFromFormattedPhoneNumber } from './helpers/inputValuePrefix.js';
import parsePhoneNumberCharacter from './helpers/parsePhoneNumberCharacter.js';
import useInputKeyDownHandler from './useInputKeyDownHandler.js';
export function createInput(defaultMetadata) {
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
    var format = useCallback(function (value) {
      // "As you type" formatter.
      var formatter = new AsYouType(country, metadata);
      var prefix = getPrefixForFormattingValueAsPhoneNumber({
        inputFormat: inputFormat,
        country: country,
        metadata: metadata
      });

      // Format the number.
      var text = formatter.input(prefix + value);
      var template = formatter.getTemplate();
      if (prefix) {
        text = removePrefixFromFormattedPhoneNumber(text, prefix);
        // `AsYouType.getTemplate()` can be `undefined`.
        if (template) {
          template = removePrefixFromFormattedPhoneNumber(template, prefix);
        }
      }
      return {
        text: text,
        template: template
      };
    }, [country, metadata]);
    var _onKeyDown = useInputKeyDownHandler({
      onKeyDown: onKeyDown,
      inputFormat: inputFormat
    });
    return /*#__PURE__*/React.createElement(Input, _extends({}, rest, {
      ref: ref,
      parse: parsePhoneNumberCharacter,
      format: format,
      onKeyDown: _onKeyDown
    }));
  }
  InputSmart = /*#__PURE__*/React.forwardRef(InputSmart);
  InputSmart.propTypes = {
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
    metadata: PropTypes.object
  };
  return InputSmart;
}
export default createInput();
//# sourceMappingURL=InputSmart.js.map