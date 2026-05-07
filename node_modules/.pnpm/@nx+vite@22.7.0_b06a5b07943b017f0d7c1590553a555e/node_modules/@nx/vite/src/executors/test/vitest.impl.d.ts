import { ExecutorContext } from '@nx/devkit';
import { VitestExecutorOptions } from './schema';
/**
 * @deprecated Use `@nx/vitest:test` instead. This executor will be removed in Nx 23.
 */
export declare function vitestExecutor(options: VitestExecutorOptions, context: ExecutorContext): AsyncGenerator<never, {
    success: boolean;
}, unknown>;
export default vitestExecutor;
//# sourceMappingURL=vitest.impl.d.ts.map