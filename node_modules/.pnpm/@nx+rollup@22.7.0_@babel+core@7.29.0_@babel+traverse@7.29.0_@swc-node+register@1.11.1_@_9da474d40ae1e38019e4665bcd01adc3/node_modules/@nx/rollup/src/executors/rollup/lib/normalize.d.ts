import { ExecutorContext } from '@nx/devkit';
import type { RollupExecutorOptions } from '../schema';
export interface NormalizedRollupExecutorOptions extends RollupExecutorOptions {
    projectRoot: string;
    rollupConfig: string[];
}
export declare function normalizeRollupExecutorOptions(options: RollupExecutorOptions, context: ExecutorContext): NormalizedRollupExecutorOptions;
export declare function normalizePluginPath(pluginPath: void | string, root: string): string;
//# sourceMappingURL=normalize.d.ts.map