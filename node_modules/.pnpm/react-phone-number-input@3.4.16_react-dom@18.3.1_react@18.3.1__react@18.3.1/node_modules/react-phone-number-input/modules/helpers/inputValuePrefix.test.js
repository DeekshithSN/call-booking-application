import metadata from 'libphonenumber-js/min/metadata';
import { getPrefixForFormattingValueAsPhoneNumber, removePrefixFromFormattedPhoneNumber } from './inputValuePrefix.js';
describe('inputValuePrefix', function () {
  it('should get input value prefix', function () {
    getPrefixForFormattingValueAsPhoneNumber({
      country: 'RU',
      metadata: metadata
    }).should.equal('');
    getPrefixForFormattingValueAsPhoneNumber({
      country: 'RU',
      inputFormat: 'INTERNATIONAL',
      metadata: metadata
    }).should.equal('');
    getPrefixForFormattingValueAsPhoneNumber({
      country: 'RU',
      inputFormat: 'NATIONAL_PART_OF_INTERNATIONAL',
      metadata: metadata
    }).should.equal('+7');
  });
  it('should remove input value prefix', function () {
    removePrefixFromFormattedPhoneNumber('+78005553535', '+7').should.equal('8005553535');
    removePrefixFromFormattedPhoneNumber('+7 800 555 35 35', '+7').should.equal('800 555 35 35');
    removePrefixFromFormattedPhoneNumber('8 (800) 555-35-35', '').should.equal('8 (800) 555-35-35');
  });
});
//# sourceMappingURL=inputValuePrefix.test.js.map