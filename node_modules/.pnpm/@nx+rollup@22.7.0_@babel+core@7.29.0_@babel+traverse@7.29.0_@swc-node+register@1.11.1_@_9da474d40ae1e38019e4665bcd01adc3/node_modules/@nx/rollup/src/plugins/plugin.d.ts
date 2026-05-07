import { type CreateDependencies, CreateNodesV2 } from '@nx/devkit';
/**
 * @deprecated The 'createDependencies' function is now a no-op. This functionality is included in 'createNodesV2'.
 */
export declare const createDependencies: CreateDependencies;
export interface RollupPluginOptions {
    buildTargetName?: string;
    buildDepsTargetName?: string;
    watchDepsTargetName?: string;
}
export declare const createNodes: CreateNodesV2<RollupPluginOptions>;
export declare const createNodesV2: CreateNodesV2<RollupPluginOptions>;
//# sourceMappingURL=plugin.d.ts.map