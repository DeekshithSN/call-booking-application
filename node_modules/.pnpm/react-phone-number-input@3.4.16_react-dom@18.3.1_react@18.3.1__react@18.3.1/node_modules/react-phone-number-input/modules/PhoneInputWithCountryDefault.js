var _excluded = ["metadata", "labels"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
import React from 'react';
import PropTypes from 'prop-types';
import defaultLabels from '../locale/en.json.js';
import { metadata as metadataPropType, labels as labelsPropType } from './PropTypes.js';
import PhoneInput from './PhoneInputWithCountry.js';
export function createPhoneInput(defaultMetadata) {
  var PhoneInputDefault = /*#__PURE__*/React.forwardRef(function (_ref, ref) {
    var _ref$metadata = _ref.metadata,
      metadata = _ref$metadata === void 0 ? defaultMetadata : _ref$metadata,
      _ref$labels = _ref.labels,
      labels = _ref$labels === void 0 ? defaultLabels : _ref$labels,
      rest = _objectWithoutProperties(_ref, _excluded);
    return /*#__PURE__*/React.createElement(PhoneInput, _extends({}, rest, {
      ref: ref,
      metadata: metadata,
      labels: labels
    }));
  });
  PhoneInputDefault.propTypes = {
    metadata: metadataPropType,
    labels: labelsPropType
  };
  return PhoneInputDefault;
}
export default createPhoneInput();
//# sourceMappingURL=PhoneInputWithCountryDefault.js.map