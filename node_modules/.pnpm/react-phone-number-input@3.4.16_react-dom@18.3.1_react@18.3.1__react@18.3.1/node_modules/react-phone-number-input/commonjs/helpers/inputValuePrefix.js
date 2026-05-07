"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPrefixForFormattingValueAsPhoneNumber = getPrefixForFormattingValueAsPhoneNumber;
exports.removePrefixFromFormattedPhoneNumber = removePrefixFromFormattedPhoneNumber;
var _core = require("libphonenumber-js/core");
function getPrefixForFormattingValueAsPhoneNumber(_ref) {
  var inputFormat = _ref.inputFormat,
    country = _ref.country,
    metadata = _ref.metadata;
  return inputFormat === 'NATIONAL_PART_OF_INTERNATIONAL' ? "+".concat((0, _core.getCountryCallingCode)(country, metadata)) : '';
}
function removePrefixFromFormattedPhoneNumber(value, prefix) {
  if (prefix) {
    value = value.slice(prefix.length);
    if (value[0] === ' ') {
      value = value.slice(1);
    }
  }
  return value;
}
//# sourceMappingURL=inputValuePrefix.js.map