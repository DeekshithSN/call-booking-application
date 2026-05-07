/**
 * Interpolates pattern tokens in a string.
 *
 * Supported tokens:
 * - {tokenName} - Simple token replacement
 * - {currentDate} - Current date in ISO format
 * - {currentDate|FORMAT} - Current date with custom format (YYYY, YY, MM, DD, HH, mm, ss)
 * - {env.VAR_NAME} - Environment variable value
 *
 * @param pattern - String containing tokens to interpolate
 * @param tokens - Record of token values
 * @returns Interpolated string
 */
export declare function interpolatePattern(pattern: string, tokens: Record<string, any>): string;
/**
 * Recursively interpolates pattern tokens in all string values within an object or array.
 *
 * @param obj - Object or array to process
 * @param tokens - Record of token values
 * @returns New object/array with interpolated values
 */
export declare function interpolateObject<T>(obj: T, tokens: Record<string, any>): T;
//# sourceMappingURL=interpolate-pattern.d.ts.map