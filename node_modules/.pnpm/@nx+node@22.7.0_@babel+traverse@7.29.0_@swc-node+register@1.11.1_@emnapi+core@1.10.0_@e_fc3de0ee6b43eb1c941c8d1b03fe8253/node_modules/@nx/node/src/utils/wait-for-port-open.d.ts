interface WaitForPortOpenOptions {
    /**
     * The host to connect to
     * @default 'localhost'
     */
    host?: string;
    /**
     * The number of retries to attempt
     * @default 120
     */
    retries?: number;
    /**
     * The delay between retries
     * @default 1000
     */
    retryDelay?: number;
}
/**
 * Waits for the given port to be open
 * @param port
 * @param options
 */
export declare function waitForPortOpen(port: number, options?: WaitForPortOpenOptions): Promise<void>;
export {};
//# sourceMappingURL=wait-for-port-open.d.ts.map