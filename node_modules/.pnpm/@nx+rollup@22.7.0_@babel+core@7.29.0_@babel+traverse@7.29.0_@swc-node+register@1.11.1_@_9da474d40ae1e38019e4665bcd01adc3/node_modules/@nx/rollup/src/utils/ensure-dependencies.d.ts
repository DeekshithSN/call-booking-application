import { type GeneratorCallback, type Tree } from '@nx/devkit';
export type EnsureDependenciesOptions = {
    compiler?: 'babel' | 'swc' | 'tsc';
};
export declare function ensureDependencies(tree: Tree, options: EnsureDependenciesOptions): GeneratorCallback;
//# sourceMappingURL=ensure-dependencies.d.ts.map