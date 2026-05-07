"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getPhoneInputWithCountryStateUpdateFromNewProps;
exports.valuesAreEqual = valuesAreEqual;
var _phoneInputHelpers = require("./phoneInputHelpers.js");
var _isE164Number = require("./isE164Number.js");
var _getInternationalPhoneNumberPrefix = _interopRequireDefault(require("./getInternationalPhoneNumberPrefix.js"));
var _countries = require("./countries.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function getPhoneInputWithCountryStateUpdateFromNewProps(props, prevProps, state) {
  var metadata = props.metadata,
    countries = props.countries,
    newDefaultCountry = props.defaultCountry,
    newValue = props.value,
    newReset = props.reset,
    international = props.international,
    displayInitialValueAsLocalNumber = props.displayInitialValueAsLocalNumber,
    initialValueFormat = props.initialValueFormat;
  var prevDefaultCountry = prevProps.defaultCountry,
    prevValue = prevProps.value,
    prevReset = prevProps.reset;
  var country = state.country,
    value = state.value,
    hasUserSelectedACountry = state.hasUserSelectedACountry,
    latestCountrySelectedByUser = state.latestCountrySelectedByUser;
  var _getInitialPhoneDigits = function _getInitialPhoneDigits(parameters) {
    return (0, _phoneInputHelpers.getInitialPhoneDigits)(_objectSpread(_objectSpread({}, parameters), {}, {
      international: international,
      useNationalFormat: displayInitialValueAsLocalNumber || initialValueFormat === 'national',
      metadata: metadata
    }));
  };

  // Some users requested a way to reset the component
  // (both number `<input/>` and country `<select/>`).
  // Whenever `reset` property changes both number `<input/>`
  // and country `<select/>` are reset.
  // It's not implemented as some instance `.reset()` method
  // because `ref` is forwarded to `<input/>`.
  // It's also not replaced with just resetting `country` on
  // external `value` reset, because a user could select a country
  // and then not input any `value`, and so the selected country
  // would be "stuck", if not using this `reset` property.
  // https://github.com/catamphetamine/react-phone-number-input/issues/300
  if (newReset !== prevReset) {
    return {
      phoneDigits: _getInitialPhoneDigits({
        value: undefined,
        defaultCountry: newDefaultCountry
      }),
      value: undefined,
      country: newDefaultCountry,
      latestCountrySelectedByUser: undefined,
      hasUserSelectedACountry: undefined
    };
  }

  // `value` is the value currently shown in the component:
  // it's stored in the component's `state`, and it's not the `value` property.
  // `prevValue` is "previous `value` property".
  // `newValue` is "new `value` property".

  // If the default country changed
  // (e.g. in case of ajax GeoIP detection after page loaded)
  // then select it, but only if the user hasn't already manually
  // selected a country, and no phone number has been manually entered so far.
  // Because if the user has already started inputting a phone number
  // then they're okay with no country being selected at all ("International")
  // and they don't want to be disturbed, don't want their input to be screwed, etc.
  if (newDefaultCountry !== prevDefaultCountry) {
    var isNewDefaultCountrySupported = !newDefaultCountry || (0, _countries.isCountrySupportedWithError)(newDefaultCountry, metadata);
    var noValueHasBeenEnteredByTheUser =
    // By default, "no value has been entered" means `value` is `undefined`.
    !value ||
    // When `international` is `true`, and some country has been pre-selected,
    // then the `<input/>` contains a pre-filled value of `+${countryCallingCode}${leadingDigits}`,
    // so in case of `international` being `true`, "the user hasn't entered anything" situation
    // doesn't just mean `value` is `undefined`, but could also mean `value` is `+${countryCallingCode}`.
    international && value === _getInitialPhoneDigits({
      value: undefined,
      defaultCountry: prevDefaultCountry
    });
    // Only update the `defaultCountry` property if no phone number
    // has been entered by the user or pre-set by the application.
    var noValueHasBeenEntered = !newValue && noValueHasBeenEnteredByTheUser;
    if (!hasUserSelectedACountry && isNewDefaultCountrySupported && noValueHasBeenEntered) {
      return {
        country: newDefaultCountry,
        // If `phoneDigits` is empty, then automatically select the new `country`
        // and set `phoneDigits` to `+{getCountryCallingCode(newCountry)}`.
        // The code assumes that "no phone number has been entered by the user",
        // and no `value` property has been passed, so the `phoneNumber` parameter
        // of `_getInitialPhoneDigits({ value, phoneNumber, ... })` is `undefined`.
        phoneDigits: _getInitialPhoneDigits({
          value: undefined,
          defaultCountry: newDefaultCountry
        }),
        // `value` is `undefined` and it stays so.
        value: undefined
      };
    }
  }

  // If a new `value` is set externally.
  // (e.g. as a result of an ajax API request
  //  to get user's phone after page loaded)
  // The first part — `newValue !== prevValue` —
  // is basically `props.value !== prevProps.value`
  // so it means "if value property was changed externally".
  // The second part — `newValue !== value` —
  // is for ignoring the `getDerivedStateFromProps()` call
  // which happens in `this.onChange()` right after `this.setState()`.
  // If this `getDerivedStateFromProps()` call isn't ignored
  // then the country flag would reset on each input.
  if (!valuesAreEqual(newValue, prevValue) && !valuesAreEqual(newValue, value)) {
    var phoneNumber;
    var parsedCountry;
    if (newValue) {
      // Validate that the newly-supplied `value` is in `E.164` format.
      // Because sometimes people attempt to supply a `value` like "+1 (879) 490-8676".
      // https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/231#note_2016334796
      if (newValue) {
        (0, _isE164Number.validateE164Number)(newValue);
      }
      phoneNumber = (0, _phoneInputHelpers.parsePhoneNumber)(newValue, metadata);
      var supportedCountries = (0, _countries.getSupportedCountries)(countries, metadata);
      if (phoneNumber && phoneNumber.country) {
        // Ignore `else` because all countries are supported in metadata.
        /* istanbul ignore next */
        if (!supportedCountries || supportedCountries.indexOf(phoneNumber.country) >= 0) {
          parsedCountry = phoneNumber.country;
        }
      } else {
        parsedCountry = (0, _phoneInputHelpers.getCountryForPartialE164Number)(newValue, {
          country: undefined,
          countries: supportedCountries,
          metadata: metadata
        });

        // In cases when multiple countries correspond to the same country calling code,
        // the phone number digits of `newValue` have to be matched against country-specific
        // regular expressions in order to determine the exact country.
        // Sometimes, that algorithm can't decide for sure which country does the phone number belong to,
        // for example when the digits of `newValue` don't match any of those regular expressions.
        // and the country of the phone number couldn't be determined.
        // In those cases, people prefer the component to show the flag of the `defaultCountry`
        // if the phone number could potentially belong to that `defaultCountry`.
        // At least that's how the component behaves when a user pastes an international
        // phone number into the input field: for example, when `defaultCountry` is `"US"`
        // and the user pastes value "+1 555 555 5555" into the input field, it keep showing "US" flag.
        // So when setting new `value` property externally, the component should behave the same way:
        // it should select the `defaultCountry` when the new `value` could potentially belong
        // to that country in cases when the exact country can't be determined.
        // https://github.com/catamphetamine/react-phone-number-input/issues/413#issuecomment-1536219404
        if (!parsedCountry) {
          if (newDefaultCountry) {
            if (newValue.indexOf((0, _getInternationalPhoneNumberPrefix["default"])(newDefaultCountry, metadata)) === 0) {
              parsedCountry = newDefaultCountry;
            }
          }
        }
      }
    }
    var userCountrySelectionHistoryStateUpdate;
    if (newValue) {
      // If the latest country that has been manually selected by the user
      // no longer corresponds to the new value then reset it.
      if (latestCountrySelectedByUser) {
        var couldNewValueCorrespondToLatestCountrySelectedByUser = parsedCountry ? latestCountrySelectedByUser === parsedCountry : (0, _phoneInputHelpers.couldNumberBelongToCountry)(newValue, latestCountrySelectedByUser, metadata);
        if (couldNewValueCorrespondToLatestCountrySelectedByUser) {
          if (!parsedCountry) {
            parsedCountry = latestCountrySelectedByUser;
          }
        } else {
          userCountrySelectionHistoryStateUpdate = {
            latestCountrySelectedByUser: undefined
          };
        }
      }
    } else {
      // When the `value` property is being reset "externally",
      // reset any tracking of the country that the user has previously selected.
      userCountrySelectionHistoryStateUpdate = {
        latestCountrySelectedByUser: undefined,
        hasUserSelectedACountry: undefined
      };
    }
    return _objectSpread(_objectSpread({}, userCountrySelectionHistoryStateUpdate), {}, {
      phoneDigits: _getInitialPhoneDigits({
        phoneNumber: phoneNumber,
        value: newValue,
        defaultCountry: newDefaultCountry
      }),
      value: newValue,
      country: newValue ? parsedCountry : newDefaultCountry
    });
  }

  // `defaultCountry` didn't change.
  // `value` didn't change.
  // `phoneDigits` didn't change, because `value` didn't change.
  //
  // So no need to update state.
}
function valuesAreEqual(value1, value2) {
  // If `value` has been set to `null` externally then convert it to `undefined`.
  //
  // For example, `react-hook-form` sets `value` to `null` when the user clears the input.
  // https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/164
  // In that case, without this conversion of `null` to `undefined`, it would reset
  // the selected country to `defaultCountry` because in that case `newValue !== value`
  // because `null !== undefined`.
  //
  // Historically, empty `value` is encoded as `undefined`.
  // Perhaps empty `value` would be better encoded as `null` instead.
  // But because that would be a potentially breaking change for some people,
  // it's left as is for the current "major" version of this library.
  //
  if (value1 === null) {
    value1 = undefined;
  }
  if (value2 === null) {
    value2 = undefined;
  }
  return value1 === value2;
}
//# sourceMappingURL=getPhoneInputWithCountryStateUpdateFromNewProps.js.map