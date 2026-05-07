import { describe, it } from 'mocha';
import { expect } from 'chai';
import hasFlag from './hasFlag.js';
describe('hasFlag', function () {
  it('should return whether a flag icon exists', function () {
    expect(hasFlag('RU')).to.equal(true);
    expect(hasFlag('ZZ')).to.equal(false);
  });
});
//# sourceMappingURL=hasFlag.test.js.map