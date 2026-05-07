"use strict";

var _metadata = _interopRequireDefault(require("libphonenumber-js/min/metadata"));
var _inputValuePrefix = require("./inputValuePrefix.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
describe('inputValuePrefix', function () {
  it('should get input value prefix', function () {
    (0, _inputValuePrefix.getPrefixForFormattingValueAsPhoneNumber)({
      country: 'RU',
      metadata: _metadata["default"]
    }).should.equal('');
    (0, _inputValuePrefix.getPrefixForFormattingValueAsPhoneNumber)({
      country: 'RU',
      inputFormat: 'INTERNATIONAL',
      metadata: _metadata["default"]
    }).should.equal('');
    (0, _inputValuePrefix.getPrefixForFormattingValueAsPhoneNumber)({
      country: 'RU',
      inputFormat: 'NATIONAL_PART_OF_INTERNATIONAL',
      metadata: _metadata["default"]
    }).should.equal('+7');
  });
  it('should remove input value prefix', function () {
    (0, _inputValuePrefix.removePrefixFromFormattedPhoneNumber)('+78005553535', '+7').should.equal('8005553535');
    (0, _inputValuePrefix.removePrefixFromFormattedPhoneNumber)('+7 800 555 35 35', '+7').should.equal('800 555 35 35');
    (0, _inputValuePrefix.removePrefixFromFormattedPhoneNumber)('8 (800) 555-35-35', '').should.equal('8 (800) 555-35-35');
  });
});
//# sourceMappingURL=inputValuePrefix.test.js.map