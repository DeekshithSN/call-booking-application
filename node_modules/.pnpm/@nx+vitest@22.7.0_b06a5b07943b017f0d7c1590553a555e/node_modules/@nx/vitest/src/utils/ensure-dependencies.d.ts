import { type GeneratorCallback, type Tree } from '@nx/devkit';
export type EnsureDependenciesOptions = {
    uiFramework: 'angular' | 'react' | 'vue' | 'none';
    compiler?: 'babel' | 'swc';
    includeLib?: boolean;
    testEnvironment?: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime' | string;
};
export declare function ensureDependencies(tree: Tree, schema: EnsureDependenciesOptions): Promise<GeneratorCallback>;
//# sourceMappingURL=ensure-dependencies.d.ts.map