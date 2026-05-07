/**
 * Check if a port is already in use by attempting to connect to it.
 * Uses waitForPortOpen with retries: 0 for an immediate check.
 */
export declare function isPortInUse(port: number, host?: string): Promise<boolean>;
//# sourceMappingURL=port-utils.d.ts.map