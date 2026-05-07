import { ExecutorContext } from '@nx/devkit';
import { VitestExecutorOptions } from '../schema';
export declare function getOptions(options: VitestExecutorOptions, context: ExecutorContext, projectRoot: string): Promise<Record<string, any>>;
/**
 * Nx's resolveNxTokensInOptions strips {workspaceRoot}/ from option values,
 * leaving a workspace-root-relative path. However, vitest resolves
 * reportsDirectory relative to the project root. This function converts
 * the path to absolute so vitest resolves it correctly.
 */
export declare function resolveReportsDirectory(reportsDirectory: string): string;
export declare function getOptionsAsArgv(obj: Record<string, any>): string[];
//# sourceMappingURL=utils.d.ts.map