import type { RunnerTestFile, Reporter } from 'vitest/node';
export declare class NxReporter implements Reporter {
    private watch;
    deferred: {
        promise: Promise<boolean>;
        resolve: (val: boolean) => void;
    };
    constructor(watch: boolean);
    [Symbol.asyncIterator](): AsyncGenerator<{
        hasErrors: boolean;
    }, void, unknown>;
    private setupDeferred;
    /** Vitest ≥ 0.29 */
    onTestRunEnd(files: any[], errors?: any): void;
    /** Vitest ≤ 0.28 */
    onFinished(files: RunnerTestFile[], errors?: unknown[]): void;
    private _handleFinished;
}
//# sourceMappingURL=nx-reporter.d.ts.map