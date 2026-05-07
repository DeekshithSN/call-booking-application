"use strict";

var _parsePhoneNumberCharacter = _interopRequireDefault(require("./parsePhoneNumberCharacter.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
describe('parsePhoneNumberCharacter', function () {
  it('should work with a new `context` argument in `parsePhoneNumberCharacter()` function (international number)', function () {
    var context = {};
    (0, _parsePhoneNumberCharacter["default"])('+', undefined, context).should.equal('+');
    expect(context).to.deep.equal({});
    (0, _parsePhoneNumberCharacter["default"])('1', '+', context).should.equal('1');
    expect(context).to.deep.equal({});
    expect((0, _parsePhoneNumberCharacter["default"])('+', '+1', context)).to.equal(undefined);
    expect(context).to.deep.equal({
      ignoreRest: true
    });
    expect((0, _parsePhoneNumberCharacter["default"])('2', '+1', context)).to.equal(undefined);
    expect(context).to.deep.equal({
      ignoreRest: true
    });
  });
  it('should work with a new `context` argument in `parsePhoneNumberCharacter()` function (national number)', function () {
    var context = {};
    (0, _parsePhoneNumberCharacter["default"])('2', undefined, context).should.equal('2');
    expect(context).to.deep.equal({});
    expect((0, _parsePhoneNumberCharacter["default"])('+', '2', context)).to.equal(undefined);
    expect(context).to.deep.equal({
      ignoreRest: true
    });
    expect((0, _parsePhoneNumberCharacter["default"])('1', '2', context)).to.equal(undefined);
    expect(context).to.deep.equal({
      ignoreRest: true
    });
  });
});
//# sourceMappingURL=parsePhoneNumberCharacter.test.js.map