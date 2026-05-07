import { getCountryCallingCode } from 'libphonenumber-js/core';
export function getPrefixForFormattingValueAsPhoneNumber(_ref) {
  var inputFormat = _ref.inputFormat,
    country = _ref.country,
    metadata = _ref.metadata;
  return inputFormat === 'NATIONAL_PART_OF_INTERNATIONAL' ? "+".concat(getCountryCallingCode(country, metadata)) : '';
}
export function removePrefixFromFormattedPhoneNumber(value, prefix) {
  if (prefix) {
    value = value.slice(prefix.length);
    if (value[0] === ' ') {
      value = value.slice(1);
    }
  }
  return value;
}
//# sourceMappingURL=inputValuePrefix.js.map