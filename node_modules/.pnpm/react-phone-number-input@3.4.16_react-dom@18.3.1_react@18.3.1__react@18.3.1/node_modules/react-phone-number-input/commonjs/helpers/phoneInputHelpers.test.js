"use strict";

var _phoneInputHelpers = require("./phoneInputHelpers.js");
var _metadata = _interopRequireDefault(require("libphonenumber-js/min/metadata"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
describe('phoneInputHelpers', function () {
  it('should get pre-selected country', function () {
    // Can't return "International". Return the first country available.
    (0, _phoneInputHelpers.getPreSelectedCountry)({
      value: '+11111111111',
      phoneNumber: {},
      countries: ['US', 'RU'],
      getAnyCountry: function getAnyCountry() {
        return 'US';
      },
      required: true,
      metadata: _metadata["default"]
    }).should.equal('US');

    // Can return "International".
    // Country can't be derived from the phone number.
    // https://github.com/catamphetamine/react-phone-number-input/issues/378
    expect((0, _phoneInputHelpers.getPreSelectedCountry)({
      value: '+11111111111',
      phoneNumber: {},
      countries: ['US', 'RU'],
      getAnyCountry: function getAnyCountry() {
        return 'US';
      },
      required: false,
      metadata: _metadata["default"]
    })).to.be.undefined;

    // Can return "International".
    // Country can't be derived from the phone number.
    // Has `defaultCountry`.
    // Has `value`.
    // https://github.com/catamphetamine/react-phone-number-input/issues/378
    expect((0, _phoneInputHelpers.getPreSelectedCountry)({
      value: '+11111111111',
      phoneNumber: {},
      defaultCountry: 'RU',
      countries: ['RU', 'FR'],
      required: false,
      metadata: _metadata["default"]
    })).to.be.undefined;

    // Can return "International".
    // Country can be derived from the phone number.
    // Has `defaultCountry`.
    // Has a valid partial `value`.
    // https://github.com/catamphetamine/react-phone-number-input/issues/378
    expect((0, _phoneInputHelpers.getPreSelectedCountry)({
      value: '+7800',
      defaultCountry: 'RU',
      countries: ['RU', 'FR'],
      required: false,
      metadata: _metadata["default"]
    })).to.equal('RU');

    // Derive country from the phone number.
    (0, _phoneInputHelpers.getPreSelectedCountry)({
      value: '+78005553535',
      phoneNumber: {
        country: 'RU',
        phone: '8005553535'
      },
      countries: ['US', 'RU'],
      getAnyCountry: function getAnyCountry() {
        return 'US';
      },
      required: true,
      metadata: _metadata["default"]
    }).should.equal('RU');

    // Country derived from the phone number overrides the supplied one.
    (0, _phoneInputHelpers.getPreSelectedCountry)({
      value: '+78005553535',
      phoneNumber: {
        country: 'RU',
        phone: '8005553535'
      },
      defaultCountry: 'US',
      countries: ['US', 'RU'],
      required: true,
      metadata: _metadata["default"]
    }).should.equal('RU');

    // Only pre-select a country if it's in the available `countries` list.
    (0, _phoneInputHelpers.getPreSelectedCountry)({
      value: '+78005553535',
      phoneNumber: {
        country: 'RU',
        phone: '8005553535'
      },
      countries: ['US', 'DE'],
      getAnyCountry: function getAnyCountry() {
        return 'US';
      },
      required: true,
      metadata: _metadata["default"]
    }).should.equal('US');
    expect((0, _phoneInputHelpers.getPreSelectedCountry)({
      value: '+78005553535',
      phoneNumber: {
        country: 'RU',
        phone: '8005553535'
      },
      defaultCountry: 'US',
      countries: ['US', 'DE'],
      required: false,
      metadata: _metadata["default"]
    })).to.be.undefined;
  });
  it('should generate country select options', function () {
    var defaultLabels = {
      'RU': 'Russia (Россия)',
      'US': 'United States',
      'ZZ': 'International'
    };

    // Without custom country names.
    (0, _phoneInputHelpers.getCountrySelectOptions)({
      countries: ['US', 'RU'],
      countryNames: defaultLabels
    }).should.deep.equal([{
      value: 'RU',
      label: 'Russia (Россия)'
    }, {
      value: 'US',
      label: 'United States'
    }]);

    // With custom country names.
    (0, _phoneInputHelpers.getCountrySelectOptions)({
      countries: ['US', 'RU'],
      countryNames: _objectSpread(_objectSpread({}, defaultLabels), {}, {
        'RU': 'Russia'
      })
    }).should.deep.equal([{
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }]);

    // Should substitute missing country names with country codes.
    (0, _phoneInputHelpers.getCountrySelectOptions)({
      countries: ['US', 'RU'],
      countryNames: _objectSpread(_objectSpread({}, defaultLabels), {}, {
        'RU': undefined
      })
    }).should.deep.equal([{
      value: 'RU',
      label: 'RU'
    }, {
      value: 'US',
      label: 'United States'
    }]);

    // With "International" (without custom country names).
    (0, _phoneInputHelpers.getCountrySelectOptions)({
      countries: ['US', 'RU'],
      countryNames: defaultLabels,
      addInternationalOption: true
    }).should.deep.equal([{
      label: 'International'
    }, {
      value: 'RU',
      label: 'Russia (Россия)'
    }, {
      value: 'US',
      label: 'United States'
    }]);

    // With "International" (with custom country names).
    (0, _phoneInputHelpers.getCountrySelectOptions)({
      countries: ['US', 'RU'],
      countryNames: _objectSpread(_objectSpread({}, defaultLabels), {}, {
        'RU': 'Russia',
        ZZ: 'Intl'
      }),
      addInternationalOption: true
    }).should.deep.equal([{
      label: 'Intl'
    }, {
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }]);
  });
  it('should generate country select options (custom `compareStrings`)', function () {
    var defaultLabels = {
      'RU': 'Russia (Россия)',
      'US': 'United States',
      'ZZ': 'International'
    };

    // Without custom country names.
    (0, _phoneInputHelpers.getCountrySelectOptions)({
      countries: ['US', 'RU'],
      countryNames: defaultLabels,
      // Reverse order.
      compareStrings: function compareStrings(a, b) {
        return a < b ? 1 : a > b ? -1 : 0;
      }
    }).should.deep.equal([{
      value: 'US',
      label: 'United States'
    }, {
      value: 'RU',
      label: 'Russia (Россия)'
    }]);
  });

  // it('should generate country select options (Chinese locale)', () => {
  // 	// https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/20
  //
  // 	const defaultLabels = {
  // 		'RU': 'Russia (Россия)',
  // 		'US': 'United States',
  // 		'ZZ': 'International'
  // 	}
  //
  // 	// Without custom country names.
  // 	getCountrySelectOptions({
  // 		countries: ['US', 'RU'],
  // 		countryNames: defaultLabels,
  // 		compareStringsLocales: 'zh-CN-u-co-pinyin'
  // 	}).should.deep.equal([{
  // 		value: 'US',
  // 		label: 'United States'
  // 	}, {
  // 		value: 'RU',
  // 		label: 'Russia (Россия)'
  // 	}])
  // })

  it('should parse phone numbers', function () {
    var phoneNumber = (0, _phoneInputHelpers.parsePhoneNumber)('+78005553535', _metadata["default"]);
    phoneNumber.country.should.equal('RU');
    phoneNumber.nationalNumber.should.equal('8005553535');

    // No `value` passed.
    expect((0, _phoneInputHelpers.parsePhoneNumber)(null, _metadata["default"])).to.be.undefined;
  });
  it('should generate national number digits', function () {
    var phoneNumber = (0, _phoneInputHelpers.parsePhoneNumber)('+33509758351', _metadata["default"]);
    (0, _phoneInputHelpers.generateNationalNumberDigits)(phoneNumber).should.equal('0509758351');
  });
  it('should migrate parsed input for new country', function () {
    // Country didn't change. Return the same digits.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('', {
      prevCountry: 'US',
      newCountry: 'US',
      metadata: _metadata["default"],
      useNationalFormat: true
    }).should.equal('');

    // Country didn't change. Return the same digits.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('123', {
      prevCountry: 'US',
      newCountry: 'US',
      metadata: _metadata["default"],
      useNationalFormat: true
    }).should.equal('123');

    // Country didn't change. Return the same digits.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+123', {
      prevCountry: 'US',
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+123');

    // No input. Returns `undefined`.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('', {
      prevCountry: 'RU',
      newCountry: 'US',
      metadata: _metadata["default"],
      useNationalFormat: true
    }).should.equal('');

    // Switching from "International" to a country
    // to which the phone number already belongs to.
    // No changes. Returns `undefined`.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+18005553535', {
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+18005553535');

    // Switching between countries. National number. No changes.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('8005553535', {
      prevCountry: 'RU',
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('8005553535');

    // Switching from "International" to a country. Calling code not matches. Resets parsed input.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+78005553535', {
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+1');

    // Switching from "International" to a country. Calling code matches. Doesn't reset parsed input.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+12223333333', {
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+12223333333');

    // Switching countries. International number. Calling code doesn't match.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+78005553535', {
      prevCountry: 'RU',
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+1');

    // Switching countries. International number. Calling code matches.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+18005553535', {
      prevCountry: 'CA',
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+18005553535');

    // Switching countries. International number.
    // Country calling code is longer than the amount of digits available.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+99', {
      prevCountry: 'KG',
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+1');

    // Switching countries. International number. No such country code.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+99', {
      prevCountry: 'KG',
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+1');

    // Switching to "International". National number.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('8800555', {
      prevCountry: 'RU',
      metadata: _metadata["default"]
    }).should.equal('+7800555');

    // Switching to "International". No national (significant) number digits entered.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('8', {
      prevCountry: 'RU',
      metadata: _metadata["default"]
      // }).should.equal('')
    }).should.equal('+7');

    // Switching to "International". International number. No changes.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+78005553535', {
      prevCountry: 'RU',
      metadata: _metadata["default"]
    }).should.equal('+78005553535');

    // Prefer national format. Country matches. Leaves the "national (significant) number".
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+78005553535', {
      newCountry: 'RU',
      metadata: _metadata["default"],
      useNationalFormat: true
    }).should.equal('8005553535');

    // Prefer national format. Country doesn't match, but country calling code does. Leaves the "national (significant) number".
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+12133734253', {
      newCountry: 'CA',
      metadata: _metadata["default"],
      useNationalFormat: true
    }).should.equal('2133734253');

    // Prefer national format. Country doesn't match, neither does country calling code. Clears the value.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+78005553535', {
      newCountry: 'US',
      metadata: _metadata["default"],
      useNationalFormat: true
    }).should.equal('');

    // Force international format. `phoneDigits` is empty. From no country to a country.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)(null, {
      newCountry: 'US',
      metadata: _metadata["default"],
      useNationalFormat: false
    }).should.equal('+1');

    // Force international format. `phoneDigits` is not empty. From a country to a country with the same calling code.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+1222', {
      prevCountry: 'CA',
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+1222');

    // Force international format. `phoneDigits` is not empty. From a country to a country with another calling code.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+1222', {
      prevCountry: 'CA',
      newCountry: 'RU',
      metadata: _metadata["default"]
    }).should.equal('+7');

    // Force international format. `phoneDigits` is not empty. From no country to a country.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)('+1222', {
      newCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('+1222');

    // `newCountry` is `undefined`.
    // `phoneDigits` are `undefined`.
    // `useNationalFormat` is `undefined`.
    (0, _phoneInputHelpers.getPhoneDigitsForNewCountry)(undefined, {
      prevCountry: 'US',
      metadata: _metadata["default"]
    }).should.equal('');
  });
  it('should format phone number in e164', function () {
    // No number.
    expect((0, _phoneInputHelpers.e164)()).to.be.undefined;

    // International number. Just a '+' sign.
    expect((0, _phoneInputHelpers.e164)('+')).to.be.undefined;

    // International number.
    (0, _phoneInputHelpers.e164)('+7800', null, _metadata["default"]).should.equal('+7800');

    // National number. Without country.
    expect((0, _phoneInputHelpers.e164)('8800', null, _metadata["default"])).to.be.undefined;

    // National number. With country. Just national prefix.
    // expect(e164('8', 'RU', metadata)).to.be.undefined
    (0, _phoneInputHelpers.e164)('8', 'RU', _metadata["default"]).should.equal('+7');

    // National number. With country.
    (0, _phoneInputHelpers.e164)('8800', 'RU', _metadata["default"]).should.equal('+7800');
  });
  it('should trim the phone number if it exceeds the maximum length', function () {
    // // No number.
    // expect(trimNumber()).to.be.undefined

    // Empty number.
    expect((0, _phoneInputHelpers.trimNumber)('', 'RU', _metadata["default"])).to.equal('');

    // // International number. Without country.
    // trimNumber('+780055535351').should.equal('+780055535351')

    // // National number. Without country.
    // trimNumber('880055535351', null).should.equal('880055535351')

    // National number. Doesn't exceed the maximum length.
    (0, _phoneInputHelpers.trimNumber)('2135553535', 'US', _metadata["default"]).should.equal('2135553535');
    // National number. Exceeds the maximum length.
    (0, _phoneInputHelpers.trimNumber)('21355535351', 'US', _metadata["default"]).should.equal('2135553535');

    // International number. Doesn't exceed the maximum length.
    (0, _phoneInputHelpers.trimNumber)('+12135553535', 'US', _metadata["default"]).should.equal('+12135553535');
    // International number. Exceeds the maximum length.
    (0, _phoneInputHelpers.trimNumber)('+121355535351', 'US', _metadata["default"]).should.equal('+12135553535');
  });
  it('should get country when inputting a national phone number for +1 calling code (`defaultCountry`)', function () {
    // Issue:
    // https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/228#note_1888308944

    // Starts inputting a phone number for default country `US`,
    // but then input value becomes `3107385` which is considered valid for `CA` country,
    // as per Google's metadata.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('3107385', {
      prevPhoneDigits: '310738',
      country: 'US',
      defaultCountry: 'US',
      latestCountrySelectedByUser: undefined,
      countryRequired: false,
      getAnyCountry: function getAnyCountry() {
        return 'RU';
      },
      international: undefined,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '3107385',
      country: 'CA',
      value: '+13107385'
    });

    // Continues inputting the phone number  for default country `US`,
    // and the input value becomes `31073850` which is no longer considered valid for `CA` country,
    // so it should switch the country back to `US`.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('31073850', {
      prevPhoneDigits: '3107385',
      country: 'CA',
      defaultCountry: 'US',
      latestCountrySelectedByUser: undefined,
      countryRequired: false,
      getAnyCountry: function getAnyCountry() {
        return 'RU';
      },
      international: undefined,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '31073850',
      country: 'US',
      value: '+131073850'
    });
  });
  it('should get country when inputting a national phone number for +1 calling code (`latestCountrySelectedByUser`)', function () {
    // Issue:
    // https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/228#note_1888308944

    // Starts inputting a phone number for default country `US`,
    // but then input value becomes `3107385` which is considered valid for `CA` country,
    // as per Google's metadata.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('3107385', {
      prevPhoneDigits: '310738',
      country: 'US',
      defaultCountry: undefined,
      latestCountrySelectedByUser: 'US',
      countryRequired: false,
      getAnyCountry: function getAnyCountry() {
        return 'RU';
      },
      international: undefined,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '3107385',
      country: 'CA',
      value: '+13107385'
    });

    // Continues inputting the phone number  for default country `US`,
    // and the input value becomes `31073850` which is no longer considered valid for `CA` country,
    // so it should switch the country back to `US`.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('31073850', {
      prevPhoneDigits: '3107385',
      country: 'CA',
      defaultCountry: undefined,
      latestCountrySelectedByUser: 'US',
      countryRequired: false,
      getAnyCountry: function getAnyCountry() {
        return 'RU';
      },
      international: undefined,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '31073850',
      country: 'US',
      value: '+131073850'
    });
  });
  it('should get country for partial E.164 number', function () {
    // Just a '+' sign.
    // Early return.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+', {
      country: 'RU',
      countries: ['US', 'RU'],
      metadata: _metadata["default"]
    }).should.equal('RU');

    // Just a '+' sign.
    // Early return.
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+', {
      countries: ['US', 'RU'],
      metadata: _metadata["default"]
    })).to.be.undefined;

    // A country can be derived.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+78005553535', {
      countries: ['US', 'RU'],
      metadata: _metadata["default"]
    }).should.equal('RU');

    // A country can be derived.
    // But that country is not allowed.
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+78005553535', {
      countries: ['US'],
      metadata: _metadata["default"]
    })).to.be.undefined;

    // A country can't be derived yet.
    // And the currently selected country does fit the number.
    // And the country is not ambiguous.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+33', {
      country: 'FR',
      countries: ['FR', 'RU'],
      metadata: _metadata["default"]
    }).should.equal('FR');

    // A country can't be derived yet.
    // And the currently selected country does fit the number.
    // And the country is ambiguous.
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', {
      country: 'RU',
      countries: ['RU'],
      metadata: _metadata["default"]
    })).to.be.undefined;

    // A country can't be derived yet.
    // And the currently selected country does fit the number.
    // And the country is ambiguous.
    // But some country is required to be selected.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', {
      country: 'RU',
      countries: ['RU'],
      required: true,
      metadata: _metadata["default"]
    }).should.equal('RU');

    // A country can't be derived yet.
    // And the currently selected country does fit the number.
    // And the country is ambiguous.
    // And the user has manually selected that country.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', {
      country: 'RU',
      countries: ['RU'],
      latestCountrySelectedByUser: 'RU',
      metadata: _metadata["default"]
    }).should.equal('RU');

    // A country can't be derived yet.
    // And the currently selected country does fit the number.
    // And the country is ambiguous.
    // And the user has manually selected some country
    // but that country doesn't fit the number.
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', {
      country: 'RU',
      countries: ['RU'],
      latestCountrySelectedByUser: 'FR',
      metadata: _metadata["default"]
    })).to.be.undefined;

    // A country can't be derived yet.
    // But the currently selected country does fit the number.
    // And the country is ambiguous.
    // And the country is a default one.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', {
      country: 'RU',
      countries: ['RU'],
      defaultCountry: 'RU',
      metadata: _metadata["default"]
    }).should.equal('RU');

    // A country can't be derived yet.
    // And the currently selected country does fit the number.
    // And the country is ambiguous.
    // And there is some default country
    // but that country doesn't fit the number.
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', {
      country: 'RU',
      countries: ['RU'],
      defaultCountry: 'FR',
      metadata: _metadata["default"]
    })).to.be.undefined;

    // A country can't be derived yet.
    // And the currently selected country doesn't fit the number.
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', {
      country: 'FR',
      countries: ['FR', 'RU'],
      metadata: _metadata["default"]
    })).to.be.undefined;

    // A country can't be derived yet.
    // And the currently selected country doesn't fit the number.
    expect((0, _phoneInputHelpers.getCountryForPartialE164Number)('+12', {
      country: 'FR',
      countries: ['FR', 'US'],
      metadata: _metadata["default"]
    })).to.be.undefined;

    // A country can't be derived yet.
    // And the currently selected country doesn't fit the number.
    // Bit "International" option is not available
    // so some country is required to be selected.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+7', {
      country: 'FR',
      countries: ['FR', 'RU'],
      required: true,
      metadata: _metadata["default"]
    }).should.equal('FR');

    // A country can't be derived yet.
    // And the currently selected country doesn't fit the number.
    // Bit "International" option is not available
    // so some country is required to be selected.
    (0, _phoneInputHelpers.getCountryForPartialE164Number)('+12', {
      country: 'FR',
      countries: ['FR', 'US'],
      required: true,
      metadata: _metadata["default"]
    }).should.equal('FR');
  });
  it('should get country from possibly incomplete international phone number', function () {
    // // `001` country calling code.
    // // Non-geographic numbering plan.
    // expect(getCountryFromPossiblyIncompleteInternationalPhoneNumber('+800', metadata)).to.be.undefined

    // Country can be derived.
    (0, _phoneInputHelpers.getCountryFromPossiblyIncompleteInternationalPhoneNumber)('+33', _metadata["default"]).should.equal('FR');

    // Country can't be derived yet.
    expect((0, _phoneInputHelpers.getCountryFromPossiblyIncompleteInternationalPhoneNumber)('+12', _metadata["default"])).to.be.undefined;
  });
  it('should compare strings', function () {
    (0, _phoneInputHelpers.compareStrings)('aa', 'ab').should.equal(-1);
    (0, _phoneInputHelpers.compareStrings)('aa', 'aa').should.equal(0);
    (0, _phoneInputHelpers.compareStrings)('aac', 'aab').should.equal(1);
  });
  it('should strip country calling code from a number', function () {
    // Number is longer than country calling code prefix.
    (0, _phoneInputHelpers.stripCountryCallingCode)('+7800', 'RU', _metadata["default"]).should.equal('800');

    // Number is shorter than (or equal to) country calling code prefix.
    (0, _phoneInputHelpers.stripCountryCallingCode)('+3', 'FR', _metadata["default"]).should.equal('');
    (0, _phoneInputHelpers.stripCountryCallingCode)('+7', 'FR', _metadata["default"]).should.equal('');

    // `country` doesn't fit the actual `number`.
    // Iterates through all available country calling codes.
    (0, _phoneInputHelpers.stripCountryCallingCode)('+7800', 'FR', _metadata["default"]).should.equal('800');

    // No `country`.
    // And the calling code doesn't belong to any country.
    (0, _phoneInputHelpers.stripCountryCallingCode)('+999', null, _metadata["default"]).should.equal('');
  });
  it('should get national significant number part', function () {
    // International number.
    (0, _phoneInputHelpers.getNationalSignificantNumberDigits)('+7800555', null, _metadata["default"]).should.equal('800555');

    // International number.
    // No national (significant) number digits.
    expect((0, _phoneInputHelpers.getNationalSignificantNumberDigits)('+', null, _metadata["default"])).to.be.undefined;
    expect((0, _phoneInputHelpers.getNationalSignificantNumberDigits)('+7', null, _metadata["default"])).to.be.undefined;

    // National number.
    (0, _phoneInputHelpers.getNationalSignificantNumberDigits)('8800555', 'RU', _metadata["default"]).should.equal('800555');

    // National number.
    // No national (significant) number digits.
    expect((0, _phoneInputHelpers.getNationalSignificantNumberDigits)('8', 'RU', _metadata["default"])).to.be.undefined;
    expect((0, _phoneInputHelpers.getNationalSignificantNumberDigits)('', 'RU', _metadata["default"])).to.be.undefined;
  });
  it('should determine of a number could belong to a country', function () {
    // Matching.
    (0, _phoneInputHelpers.couldNumberBelongToCountry)('+7800', 'RU', _metadata["default"]).should.equal(true);

    // First digit already not matching.
    (0, _phoneInputHelpers.couldNumberBelongToCountry)('+7800', 'FR', _metadata["default"]).should.equal(false);

    // First digit matching, second - not matching.
    (0, _phoneInputHelpers.couldNumberBelongToCountry)('+33', 'AM', _metadata["default"]).should.equal(false);

    // Number is shorter than country calling code.
    (0, _phoneInputHelpers.couldNumberBelongToCountry)('+99', 'KG', _metadata["default"]).should.equal(true);
  });
  it('should handle phone digits change (should choose new "value" based on phone digits)', function () {
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+', {
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+',
      country: undefined,
      value: undefined
    });
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+', {
      metadata: _metadata["default"],
      countryRequired: true,
      getAnyCountry: function getAnyCountry() {
        return 'US';
      }
    }).should.deep.equal({
      phoneDigits: '+',
      country: 'US',
      value: undefined
    });
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+7', {
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+7',
      country: undefined,
      value: '+7'
    });
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+7', {
      metadata: _metadata["default"],
      country: 'RU'
    }).should.deep.equal({
      phoneDigits: '+7',
      country: 'RU',
      value: undefined
    });
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+330', {
      metadata: _metadata["default"],
      country: 'FR'
    }).should.deep.equal({
      phoneDigits: '+330',
      country: 'FR',
      value: '+33'
    });
  });
  it('should handle phone digits change', function () {
    // Doesn't really support passing an `undefined` value.
    // I dunno why doesn't it throw an error here.
    // Anyway, since this test already existed, I didn't remove it.
    (0, _phoneInputHelpers.onPhoneDigitsChange)(undefined, {
      country: 'RU',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: undefined,
      country: 'RU',
      value: undefined
    });
    (0, _phoneInputHelpers.onPhoneDigitsChange)('', {
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '',
      country: undefined,
      value: undefined
    });
    (0, _phoneInputHelpers.onPhoneDigitsChange)('1213', {
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+1213',
      country: undefined,
      value: '+1213'
    });
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+1213', {
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+1213',
      country: undefined,
      value: '+1213'
    });

    // Will reset an automatically selected country when it's ambiguous.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('213', {
      country: 'US',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '213',
      country: undefined,
      value: '+1213'
    });

    // Won't reset a default selected country when it's ambiguous.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('213', {
      country: 'US',
      defaultCountry: 'US',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '213',
      country: 'US',
      value: '+1213'
    });

    // Won't reset a manually selected country when it's ambiguous.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('213', {
      country: 'US',
      latestCountrySelectedByUser: 'US',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '213',
      country: 'US',
      value: '+1213'
    });

    // When inputting a valid number for another country
    // it should switch to that other country.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+78005553535', {
      country: 'US',
      defaultCountry: 'US',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+78005553535',
      country: 'RU',
      value: '+78005553535'
    });

    // Won't reset an already selected default country when it is ambiguous.
    // Full number entered.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+15555555555', {
      country: 'US',
      defaultCountry: 'US',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+15555555555',
      country: 'US',
      value: '+15555555555'
    });

    // Won't reset an already manually selected country when it is ambiguous.
    // Full number entered.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+15555555555', {
      country: 'US',
      latestCountrySelectedByUser: 'US',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+15555555555',
      country: 'US',
      value: '+15555555555'
    });

    // Will reset an automatically selected country when it is ambiguous.
    // Full number entered.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+15555555555', {
      country: 'US',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+15555555555',
      country: undefined,
      value: '+15555555555'
    });

    // Should reset the country if it has likely been automatically
    // selected based on international phone number input,
    // and the user decides to erase all input,
    // and the country neither was selected manually by either not it is a default one.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('', {
      prevPhoneDigits: '+78005553535',
      country: 'RU',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '',
      country: undefined,
      value: undefined
    });

    // Should reset the country if it has likely been automatically
    // selected based on international phone number input,
    // and the user decides to erase all input,
    // and the country neither was selected manually by either not it is a default one.
    // Should reset the country to the default one.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('', {
      prevPhoneDigits: '+78005553535',
      country: 'RU',
      defaultCountry: 'US',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '',
      country: 'US',
      value: undefined
    });

    // Should reset the country if it has likely been automatically
    // selected based on international phone number input
    // and the user decides to erase all input up to the `+` sign.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+', {
      prevPhoneDigits: '+78005553535',
      country: 'RU',
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+',
      country: undefined,
      value: undefined
    });
  });
  it('should handle phone digits change (limitMaxLength: true)', function () {
    (0, _phoneInputHelpers.onPhoneDigitsChange)('21337342530', {
      country: 'US',
      limitMaxLength: true,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '2133734253',
      country: 'US',
      value: '+12133734253'
    });
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+121337342530', {
      country: 'US',
      limitMaxLength: true,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+12133734253',
      country: 'US',
      value: '+12133734253'
    });

    // This case is intentionally ignored to simplify the code.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+121337342530', {
      limitMaxLength: true,
      metadata: _metadata["default"]
    }).should.deep.equal({
      // phoneDigits: '+12133734253',
      // country: 'US',
      // value: '+12133734253'
      phoneDigits: '+121337342530',
      country: undefined,
      value: '+121337342530'
    });
  });
  it('should handle phone digits change (`international: true`)', function () {
    // Shouldn't set `country` to `defaultCountry`
    // when erasing parsed input starting with a `+`
    // when `international` is `true`.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('', {
      prevPhoneDigits: '+78005553535',
      country: 'RU',
      defaultCountry: 'US',
      international: true,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '',
      country: undefined,
      value: undefined
    });

    // Should support forcing international phone number input format.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('2', {
      prevPhoneDigits: '+78005553535',
      country: 'RU',
      international: true,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+2',
      country: undefined,
      value: '+2'
    });
  });
  it('should handle phone digits change (`international: true` and `countryCallingCodeEditable: false`) (reset incompatible international input)', function () {
    // With `country`.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+1', {
      prevPhoneDigits: '+78005553535',
      country: 'RU',
      international: true,
      countryCallingCodeEditable: false,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+7',
      country: 'RU',
      value: undefined
    });

    // Without `country`.
    // Not possible because passing `countryCallingCodeEditable: false` flag
    // automatically means that some country calling code is specified
    // meaning that there is a `country`.
    // Still, test coverage requires the "else path" to be covered.
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+1', {
      prevPhoneDigits: '+78005553535',
      country: undefined,
      international: true,
      countryCallingCodeEditable: false,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+1',
      country: undefined,
      value: '+1'
    });
  });
  it('should handle phone digits change (`international: true` and `countryCallingCodeEditable: false`) (append national input)', function () {
    (0, _phoneInputHelpers.onPhoneDigitsChange)('8', {
      prevPhoneDigits: '+78005553535',
      country: 'RU',
      international: true,
      countryCallingCodeEditable: false,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+78',
      country: 'RU',
      value: '+78'
    });
  });
  it('should handle phone digits change (`international: true` and `countryCallingCodeEditable: false`) (compatible input)', function () {
    (0, _phoneInputHelpers.onPhoneDigitsChange)('+7', {
      prevPhoneDigits: '+78005553535',
      country: 'RU',
      international: true,
      countryCallingCodeEditable: false,
      metadata: _metadata["default"]
    }).should.deep.equal({
      phoneDigits: '+7',
      country: 'RU',
      value: undefined
    });
  });
  it('should handle phone digits change (`international: false`)', function () {
    var onChange = function onChange(phoneDigits, prevPhoneDigits, country, rest) {
      return (0, _phoneInputHelpers.onPhoneDigitsChange)(phoneDigits, _objectSpread(_objectSpread({}, rest), {}, {
        prevPhoneDigits: prevPhoneDigits,
        country: country,
        international: false,
        metadata: _metadata["default"]
      }));
    };

    // `phoneDigits` in international format.
    // Just country calling code.
    onChange('+7', '', 'RU').should.deep.equal({
      phoneDigits: '',
      country: 'RU',
      value: undefined
    });

    // `phoneDigits` in international format.
    // Country calling code and first digit.
    // (which is assumed a "national prefix").
    // Reset an automatically selected country.
    onChange('+78', '', 'RU').should.deep.equal({
      phoneDigits: '8',
      country: undefined,
      // value: undefined
      value: '+7'
    });

    // `phoneDigits` in international format.
    // Country calling code and first digit.
    // (which is assumed a "national prefix").
    // Won't reset a manually selected country.
    onChange('+78', '', 'RU', {
      latestCountrySelectedByUser: 'RU'
    }).should.deep.equal({
      phoneDigits: '8',
      country: 'RU',
      // value: undefined
      value: '+7'
    });

    // `phoneDigits` in international format.
    // Country calling code and first digit.
    // (which is assumed a "national prefix").
    // Won't reset an automatically selected default country.
    onChange('+78', '', 'RU', {
      defaultCountry: 'RU'
    }).should.deep.equal({
      phoneDigits: '8',
      country: 'RU',
      // value: undefined
      value: '+7'
    });

    // `phoneDigits` in international format.
    // Country calling code and first two digits.
    // Reset an automatically selected country.
    onChange('+121', '', 'US').should.deep.equal({
      phoneDigits: '21',
      country: undefined,
      value: '+121'
    });

    // `phoneDigits` in international format.
    // Country calling code and first two digits.
    // Won't reset a manually selected country.
    onChange('+121', '', 'US', {
      latestCountrySelectedByUser: 'US'
    }).should.deep.equal({
      phoneDigits: '21',
      country: 'US',
      value: '+121'
    });

    // `phoneDigits` in international format.
    // Country calling code and first two digits.
    // Won't reset an automatically selected default country.
    onChange('+121', '', 'US', {
      defaultCountry: 'US'
    }).should.deep.equal({
      phoneDigits: '21',
      country: 'US',
      value: '+121'
    });

    // `phoneDigits` in international format.
    onChange('+78005553535', '', 'RU').should.deep.equal({
      phoneDigits: '88005553535',
      country: 'RU',
      value: '+78005553535'
    });

    // `phoneDigits` in international format.
    // Another country: just trims the `+`.
    // Reset an automatically selected country.
    onChange('+78005553535', '', 'US').should.deep.equal({
      phoneDigits: '78005553535',
      country: undefined,
      value: '+178005553535'
    });

    // `phoneDigits` in international format.
    // Another country: just trims the `+`.
    // Won't reset a manually selected country.
    onChange('+78005553535', '', 'US', {
      latestCountrySelectedByUser: 'US'
    }).should.deep.equal({
      phoneDigits: '78005553535',
      country: 'US',
      value: '+178005553535'
    });

    // `phoneDigits` in international format.
    // Another country: just trims the `+`.
    // Won't reset an automatically selected default country.
    onChange('+78005553535', '', 'US', {
      defaultCountry: 'US'
    }).should.deep.equal({
      phoneDigits: '78005553535',
      country: 'US',
      value: '+178005553535'
    });

    // `phoneDigits` in national format.
    onChange('88005553535', '', 'RU').should.deep.equal({
      phoneDigits: '88005553535',
      country: 'RU',
      value: '+78005553535'
    });

    // `phoneDigits` in national format.
    onChange('88005553535', '8800555353', 'RU').should.deep.equal({
      phoneDigits: '88005553535',
      country: 'RU',
      value: '+78005553535'
    });

    // Empty `phoneDigits`.
    onChange('', '88005553535', 'RU').should.deep.equal({
      phoneDigits: '',
      country: 'RU',
      value: undefined
    });
  });
  it('should handle phone digits change (`international: false` and no country selected)', function () {
    // If `international` is `false` then it means that
    // "International" option should not be available,
    // so it doesn't handle the cases when it is available.

    var onChange = function onChange(phoneDigits) {
      return (0, _phoneInputHelpers.onPhoneDigitsChange)(phoneDigits, {
        prevPhoneDigits: '',
        international: false,
        metadata: _metadata["default"]
      });
    };

    // `phoneDigits` in international format.
    // No country calling code.
    onChange('+').should.deep.equal({
      phoneDigits: '+',
      country: undefined,
      value: undefined
    });

    // `phoneDigits` in international format.
    // Just country calling code.
    onChange('+7').should.deep.equal({
      phoneDigits: '+7',
      country: undefined,
      value: '+7'
    });

    // `phoneDigits` in international format.
    // Country calling code and first digit.
    // (which is assumed a "national prefix").
    onChange('+330').should.deep.equal({
      phoneDigits: '',
      country: 'FR',
      value: undefined
    });

    // `phoneDigits` in international format.
    // Country calling code, national prefix and first "significant" digit.
    onChange('+3301').should.deep.equal({
      phoneDigits: '1',
      country: 'FR',
      value: '+331'
    });

    // `phoneDigits` in international format.
    // Full number.
    onChange('+78005553535').should.deep.equal({
      phoneDigits: '88005553535',
      country: 'RU',
      value: '+78005553535'
    });
  });
  it('should get initial parsed input', function () {
    (0, _phoneInputHelpers.getInitialPhoneDigits)({
      value: '+78005553535',
      defaultCountry: 'RU',
      international: false,
      metadata: _metadata["default"]
    }).should.equal('+78005553535');
    (0, _phoneInputHelpers.getInitialPhoneDigits)({
      value: '+78005553535',
      defaultCountry: 'RU',
      international: true,
      metadata: _metadata["default"]
    }).should.equal('+78005553535');
    (0, _phoneInputHelpers.getInitialPhoneDigits)({
      value: undefined,
      defaultCountry: 'RU',
      international: true,
      metadata: _metadata["default"]
    }).should.equal('+7');
    expect((0, _phoneInputHelpers.getInitialPhoneDigits)({
      value: undefined,
      defaultCountry: 'RU',
      international: false,
      metadata: _metadata["default"]
    })).to.be.undefined;
    expect((0, _phoneInputHelpers.getInitialPhoneDigits)({
      value: undefined,
      international: false,
      metadata: _metadata["default"]
    })).to.be.undefined;
  });
  it('should get initial parsed input (has `phoneNumber` that has `country`)', function () {
    var phoneNumber = (0, _phoneInputHelpers.parsePhoneNumber)('+78005553535', _metadata["default"]);
    (0, _phoneInputHelpers.getInitialPhoneDigits)({
      value: phoneNumber.number,
      defaultCountry: 'RU',
      useNationalFormat: true,
      phoneNumber: phoneNumber,
      metadata: _metadata["default"]
    }).should.equal('88005553535');
  });
  it('should get initial parsed input (has `phoneNumber` that has no `country`)', function () {
    var phoneNumber = (0, _phoneInputHelpers.parsePhoneNumber)('+870773111632', _metadata["default"]);
    (0, _phoneInputHelpers.getInitialPhoneDigits)({
      value: phoneNumber.number,
      defaultCountry: 'RU',
      useNationalFormat: true,
      phoneNumber: phoneNumber,
      metadata: _metadata["default"]
    }).should.equal('+870773111632');
  });
});
//# sourceMappingURL=phoneInputHelpers.test.js.map