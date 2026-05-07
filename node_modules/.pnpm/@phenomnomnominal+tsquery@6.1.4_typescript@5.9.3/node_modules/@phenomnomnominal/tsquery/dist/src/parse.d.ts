/// <reference types="esquery" />
import type { Selector } from './index';
/**
 * @public
 * Parse a `string` into an ESQuery `Selector`.
 *
 * @param selector - a TSQuery `Selector` (using the [ESQuery selector syntax](https://github.com/estools/esquery)).
 * @returns a validated `Selector` or `null` if the input `string` is invalid.
 * @throws if the `Selector` is syntactically valid, but contains an invalid TypeScript Node kind.
 */
export declare function parse(selector: string): Selector | null;
export declare namespace parse {
    var ensure: (selector: string | Selector) => Selector;
}
