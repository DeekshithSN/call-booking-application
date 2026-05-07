"use strict";

var _metadata = _interopRequireDefault(require("libphonenumber-js/min/metadata"));
var _getInternationalPhoneNumberPrefix = _interopRequireDefault(require("./getInternationalPhoneNumberPrefix.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
describe('getInternationalPhoneNumberPrefix', function () {
  it('should prepend leading digits when generating international phone number prefix', function () {
    // No leading digits.
    (0, _getInternationalPhoneNumberPrefix["default"])('RU', _metadata["default"]).should.equal('+7');

    // The "pre-fill with leading digits on country selection" feature had to be reverted.
    // https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/10#note_1231042367
    // // Has "fixed" leading digits.
    // // https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/10
    // getInternationalPhoneNumberPrefix('AS', metadata).should.equal('+1684')
  });
});
//# sourceMappingURL=getInternationalPhoneNumberPrefix.test.js.map