/**
 * Convert a CSS class name to a valid JavaScript identifier
 * This is used when generating exports for CSS modules
 */
/**
 * Escape dashes in class names to make them valid JS identifiers
 * e.g., "my-class" -> "myClass"
 */
export declare function escapeClassNameDashes(name: string): string;
/**
 * Convert a CSS class name to a safe JavaScript identifier
 */
export declare function safeIdentifier(name: string): string;
//# sourceMappingURL=safe-identifier.d.ts.map