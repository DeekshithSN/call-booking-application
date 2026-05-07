"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _formatPhoneNumber2 = _interopRequireWildcard(require("./formatPhoneNumber.js"));
var _metadata = _interopRequireDefault(require("libphonenumber-js/min/metadata"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function call(func, _arguments) {
  var args = Array.prototype.slice.call(_arguments);
  args.push(_metadata["default"]);
  return func.apply(this, args);
}
function formatPhoneNumber() {
  return call(_formatPhoneNumber2["default"], arguments);
}
function formatPhoneNumberIntl() {
  return call(_formatPhoneNumber2.formatPhoneNumberIntl, arguments);
}
describe('formatPhoneNumber', function () {
  it('should format phone numbers', function () {
    expect(function () {
      return formatPhoneNumber();
    }).to["throw"]('must be a string');
    // formatPhoneNumber().should.equal('')
    formatPhoneNumber(null).should.equal('');
    formatPhoneNumber('').should.equal('');
    expect(function () {
      return (0, _formatPhoneNumber2["default"])('+1', 'NATIONAL');
    }).to["throw"]('`metadata` argument not passed');
    expect(function () {
      return (0, _formatPhoneNumber2["default"])('+12133734253', undefined, _metadata["default"]);
    }).to["throw"]('Unknown "format"');
    expect(function () {
      return (0, _formatPhoneNumber2["default"])('+12133734253', '123', _metadata["default"]);
    }).to["throw"]('Unknown "format"');
    formatPhoneNumber('+1', 'NATIONAL').should.equal('');
    formatPhoneNumber('+12133734253', 'NATIONAL').should.equal('(213) 373-4253');
    formatPhoneNumber('+12133734253').should.equal('(213) 373-4253');
    formatPhoneNumber('+12133734253', 'INTERNATIONAL').should.equal('+1 213 373 4253');
    // Deprecated.
    // Legacy `format`s.
    formatPhoneNumber('+12133734253', 'National').should.equal('(213) 373-4253');
    formatPhoneNumber('+12133734253', 'International').should.equal('+1 213 373 4253');
  });
  it('should format international phone numbers', function () {
    formatPhoneNumberIntl('+12133734253').should.equal('+1 213 373 4253');
  });
});
//# sourceMappingURL=formatPhoneNumber.test.js.map