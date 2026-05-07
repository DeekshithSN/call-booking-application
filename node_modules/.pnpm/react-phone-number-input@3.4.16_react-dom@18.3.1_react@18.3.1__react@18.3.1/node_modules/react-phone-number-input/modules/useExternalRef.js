function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import { useRef, useCallback } from 'react';

/**
 * This hook creates an internal copy of a `ref`
 * and returns a new `ref`-alike setter function
 * that updates both `ref` and the internal copy of it.
 * That `ref`-alike setter function could then be passed
 * to child elements instead of the original `ref`.
 *
 * The internal copy of the `ref` can then be used to
 * call instance methods like `.focus()`, etc.
 *
 * One may ask: why create a copy of `ref` for "internal" use
 * when the code could use the original `ref` for that.
 * The answer is: the code would have to dance around the original `ref` anyway
 * to figure out whether it exists and to find out the internal implementation of it
 * in order to read its value correctly. This hook encapsulates all that "boilerplate" code.
 * The returned copy of the `ref` is guaranteed to exist and functions as a proper ref "object".
 * The returned `ref`-alike setter function must be used instead of the original `ref`
 * when passing it to child elements.
 *
 * @param  {(object|function)} [externalRef] — The original `ref` that may have any internal implementation and might not even exist.
 * @return {any[]} Returns an array of two elements: a copy of the `ref` for "internal" use and a `ref`-alike setter function that should be used in-place of the original `ref` when passing it to child elements.
 */
export default function useExternalRef(externalRef) {
  // Create a copy of the original `ref` (which might not exist).
  // Both refs will point to the same value.
  var refCopy = useRef();

  // Updates both `ref`s with the same `value`.
  var refSetter = useCallback(function (value) {
    setRefsValue([externalRef, refCopy], value);
  }, [externalRef, refCopy]);
  return [refCopy, refSetter];
}

// Sets the same `value` of all `ref`s.
// Some of the `ref`s may not exist in which case they'll be skipped.
export function setRefsValue(refs, value) {
  for (var _iterator = _createForOfIteratorHelperLoose(refs), _step; !(_step = _iterator()).done;) {
    var ref = _step.value;
    if (ref) {
      setRefValue(ref, value);
    }
  }
}

// Sets the value of a `ref`.
// Before React Hooks were introduced, `ref`s used to be functions.
// After React Hooks were introduces, `ref`s became objects with `.current` property.
// This function sets a `ref`'s value regardless of its internal implementation,
// so it supports both types of `ref`s.
function setRefValue(ref, value) {
  if (typeof ref === 'function') {
    ref(value);
  } else {
    ref.current = value;
  }
}
//# sourceMappingURL=useExternalRef.js.map