"use strict";

var _metadata = _interopRequireDefault(require("libphonenumber-js/min/metadata"));
var _getPhoneInputWithCountryStateUpdateFromNewProps2 = _interopRequireDefault(require("./getPhoneInputWithCountryStateUpdateFromNewProps.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function getPhoneInputWithCountryStateUpdateFromNewProps(newProps, prevProps, state) {
  return (0, _getPhoneInputWithCountryStateUpdateFromNewProps2["default"])(_objectSpread(_objectSpread({}, newProps), {}, {
    metadata: _metadata["default"]
  }), _objectSpread(_objectSpread({}, prevProps), {}, {
    metadata: _metadata["default"]
  }), state);
}
describe('getPhoneInputWithCountryStateUpdateFromNewProps', function () {
  it('should get state update from new props (reset)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      reset: true,
      defaultCountry: 'RU'
    }, {}, {}).should.deep.equal({
      phoneDigits: undefined,
      value: undefined,
      country: 'RU',
      latestCountrySelectedByUser: undefined,
      hasUserSelectedACountry: undefined
    });
  });
  it('should get state update from new props (reset) (international)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      reset: true,
      international: true,
      defaultCountry: 'RU'
    }, {}, {}).should.deep.equal({
      phoneDigits: '+7',
      value: undefined,
      country: 'RU',
      latestCountrySelectedByUser: undefined,
      hasUserSelectedACountry: undefined
    });
  });
  it('should get state update from new props (default country did not change)', function () {
    expect(getPhoneInputWithCountryStateUpdateFromNewProps({
      defaultCountry: 'RU'
    }, {
      defaultCountry: 'RU'
    }, {})).to.be.undefined;
  });
  it('should get state update from new props (default country changed) (no `value`)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      defaultCountry: 'RU'
    }, {
      defaultCountry: 'US'
    }, {}).should.deep.equal({
      country: 'RU',
      phoneDigits: undefined,
      value: undefined
    });
  });
  it('should get state update from new props (default country changed) (no `value`) (new country not supported)', function () {
    expect(getPhoneInputWithCountryStateUpdateFromNewProps({
      defaultCountry: 'XX'
    }, {
      defaultCountry: 'US'
    }, {})).to.be.undefined;
  });
  it('should get state update from new props (default country changed) (`value` is intl prefix)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      international: true,
      defaultCountry: 'CA'
    }, {
      international: true,
      defaultCountry: 'US'
    }, {
      value: '+1'
    }).should.deep.equal({
      country: 'CA',
      phoneDigits: '+1',
      value: undefined
    });
  });
  it('should get state update from new props (default country changed) (has `value`)', function () {
    expect(getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+78005553535',
      defaultCountry: 'FR'
    }, {
      value: '+78005553535',
      defaultCountry: 'RU'
    }, {})).to.be.undefined;
  });
  it('should get state update from new props (default country changed to `undefined`) (has `value`)', function () {
    expect(getPhoneInputWithCountryStateUpdateFromNewProps({
      value: undefined,
      defaultCountry: 'FR'
    }, {
      value: undefined,
      defaultCountry: undefined
    }, {})).to.deep.equal({
      country: 'FR',
      phoneDigits: undefined,
      value: undefined
    });
  });
  it('should get state update from new props (`value` changed: undefined -> value)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+78005553535',
      defaultCountry: 'FR'
    }, {
      defaultCountry: 'US'
    }, {}).should.deep.equal({
      country: 'RU',
      phoneDigits: '+78005553535',
      value: '+78005553535'
    });
  });
  it('should get state update from new props (`value` changed: value -> undefined)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      defaultCountry: 'RU'
    }, {
      value: '+78005553535',
      defaultCountry: 'RU'
    }, {
      value: '+78005553535'
    }).should.deep.equal({
      country: 'RU',
      phoneDigits: undefined,
      value: undefined,
      latestCountrySelectedByUser: undefined,
      hasUserSelectedACountry: undefined
    });
  });
  it('should get state update from new props (`value` changed: `undefined` and `null` are treated the same)', function () {
    expect(getPhoneInputWithCountryStateUpdateFromNewProps({
      value: null,
      defaultCountry: 'RU'
    }, {
      value: null,
      defaultCountry: 'RU'
    }, {
      value: undefined
    })).to.be.undefined;
  });

  // https://github.com/catamphetamine/react-phone-number-input/issues/377
  it('should get state update from new props (`value` changed: undefined -> +33)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+33'
    }, {}, {}).should.deep.equal({
      country: 'FR',
      phoneDigits: '+33',
      value: '+33'
    });
  });

  // https://github.com/catamphetamine/react-phone-number-input/issues/377
  it('should get state update from new props (`value` changed: undefined -> +1) (new country is ambiguous)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+1'
    }, {}, {}).should.deep.equal({
      country: undefined,
      phoneDigits: '+1',
      value: '+1'
    });
  });

  // https://github.com/catamphetamine/react-phone-number-input/issues/377
  it('should get state update from new props (`value` changed: undefined -> +1) (new country is ambiguous) (has default country)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+1',
      defaultCountry: 'CA'
    }, {}, {}).should.deep.equal({
      country: 'CA',
      phoneDigits: '+1',
      value: '+1'
    });
  });

  // https://github.com/catamphetamine/react-phone-number-input/issues/377
  it('should get state update from new props (`value` changed: undefined -> +1) (new country is ambiguous) (has default country) (default country doesn\'t match the number)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+1',
      defaultCountry: 'RU'
    }, {}, {}).should.deep.equal({
      country: undefined,
      phoneDigits: '+1',
      value: '+1'
    });
  });
  it('should get state update from new props (`value` changed: undefined -> +1) (new country is ambiguous) (has default country) (default country doesn\'t match the number) (has latest manually selected country) (latest manually selected country fits the number)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+1',
      defaultCountry: 'RU'
    }, {}, {
      latestCountrySelectedByUser: 'US'
    }).should.deep.equal({
      country: 'US',
      phoneDigits: '+1',
      value: '+1'
    });
  });
  it('should get state update from new props (`value` changed: undefined -> +1) (new country is not ambiguous) (has default country) (default country doesn\'t match the number) (has latest manually selected country) (latest manually selected country does match the parsed country)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+33',
      defaultCountry: 'RU'
    }, {}, {
      latestCountrySelectedByUser: 'FR'
    }).should.deep.equal({
      country: 'FR',
      phoneDigits: '+33',
      value: '+33'
    });
  });
  it('should get state update from new props (`value` changed: undefined -> +1) (new country is ambiguous) (has default country) (default country doesn\'t match the number) (has latest manually selected country) (the latest manually selected country doesn\'t match the number)', function () {
    getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+1',
      defaultCountry: 'RU'
    }, {}, {
      latestCountrySelectedByUser: 'FR'
    }).should.deep.equal({
      country: undefined,
      latestCountrySelectedByUser: undefined,
      phoneDigits: '+1',
      value: '+1'
    });
  });
  it('should get state update from new props (`value` changed, but already displayed)', function () {
    expect(getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+78005553535'
    }, {}, {
      value: '+78005553535'
    })).to.be.undefined;
  });
  it('should get state update from new props (`value` did not change)', function () {
    expect(getPhoneInputWithCountryStateUpdateFromNewProps({
      value: '+78005553535'
    }, {
      value: '+78005553535'
    }, {})).to.be.undefined;
  });
});
//# sourceMappingURL=getPhoneInputWithCountryStateUpdateFromNewProps.test.js.map