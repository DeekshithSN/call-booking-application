/**
 * Checks if a URL string is absolute (has protocol)
 */
export declare function isAbsoluteUrl(url: string): boolean;
/**
 * Safely processes remote locations, handling both relative and absolute URLs
 * while preserving query parameters and hash fragments for absolute URLs
 */
export declare function processRemoteLocation(remoteLocation: string, remoteEntryExt: 'js' | 'mjs'): string;
/**
 * Processes remote URLs for runtime environments, resolving relative URLs against window.location.origin
 */
export declare function processRuntimeRemoteUrl(remoteUrl: string, remoteEntryExt: 'js' | 'mjs'): string;
//# sourceMappingURL=url-helpers.d.ts.map