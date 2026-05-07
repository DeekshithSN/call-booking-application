import * as rollup from 'rollup';
import { type ExecutorContext } from '@nx/devkit';
import { RollupExecutorOptions } from './schema';
import { NormalizedRollupExecutorOptions } from './lib/normalize';
export declare function rollupExecutor(rawOptions: RollupExecutorOptions, context: ExecutorContext): AsyncGenerator<unknown, any, any>;
export declare function createRollupOptions(options: NormalizedRollupExecutorOptions, context: ExecutorContext): Promise<rollup.RollupOptions | rollup.RollupOptions[]>;
export default rollupExecutor;
//# sourceMappingURL=rollup.impl.d.ts.map