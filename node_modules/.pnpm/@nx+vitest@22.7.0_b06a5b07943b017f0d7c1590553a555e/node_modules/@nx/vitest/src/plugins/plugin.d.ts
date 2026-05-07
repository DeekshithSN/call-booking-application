import { CreateDependencies, CreateNodesV2 } from '@nx/devkit';
export interface VitestPluginOptions {
    testTargetName?: string;
    /**
     * Atomizer for vitest
     */
    ciTargetName?: string;
    /**
     * The name that should be used to group atomized tasks on CI
     */
    ciGroupName?: string;
    /**
     * Default mode for running tests.
     * - 'watch': Tests run in watch mode locally, auto-run in CI (default)
     * - 'run': Tests run once and exit
     */
    testMode?: 'watch' | 'run';
}
/**
 * @deprecated The 'createDependencies' function is now a no-op. This functionality is included in 'createNodesV2'.
 */
export declare const createDependencies: CreateDependencies;
export declare const createNodes: CreateNodesV2<VitestPluginOptions>;
export declare const createNodesV2: CreateNodesV2<VitestPluginOptions>;
//# sourceMappingURL=plugin.d.ts.map