import { Tree } from 'nx/src/generators/tree';
import { GeneratorCallback } from '@nx/devkit';
import { NormalizedSchema } from '../schema';
export declare function addRollupBuildTarget(host: Tree, options: NormalizedSchema & {
    format?: Array<'esm' | 'cjs'>;
}, external?: Set<String>): Promise<GeneratorCallback>;
//# sourceMappingURL=add-rollup-build-target.d.ts.map