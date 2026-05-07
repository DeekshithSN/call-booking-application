/**
 * Normalize file path to use forward slashes (POSIX style)
 * This ensures consistent path handling across Windows and Unix systems
 */
export declare function normalizePath(path: string | undefined): string;
/**
 * Convert an absolute path to a human-readable relative path from cwd
 */
export declare function humanizePath(filepath: string): string;
//# sourceMappingURL=normalize-path.d.ts.map