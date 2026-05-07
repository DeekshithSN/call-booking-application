import { Tree } from '@nx/devkit';
export type Target = 'build' | 'serve' | 'test' | 'preview';
export type TargetFlags = Partial<Record<Target, boolean>>;
export interface VitestGeneratorSchema {
    project: string;
    uiFramework?: 'angular' | 'react' | 'vue' | 'none';
    coverageProvider: 'v8' | 'istanbul' | 'custom';
    inSourceTests?: boolean;
    skipViteConfig?: boolean;
    testTarget?: string;
    skipFormat?: boolean;
    testEnvironment?: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime' | string;
    addPlugin?: boolean;
    runtimeTsconfigFileName?: string;
    compiler?: 'babel' | 'swc';
    projectType?: 'application' | 'library';
}
export declare function addOrChangeTestTarget(tree: Tree, options: VitestGeneratorSchema, hasPlugin: boolean): void;
export interface ViteConfigFileOptions {
    project: string;
    includeLib?: boolean;
    includeVitest?: boolean;
    inSourceTests?: boolean;
    testEnvironment?: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime' | string;
    rollupOptionsExternal?: string[];
    imports?: string[];
    plugins?: string[];
    coverageProvider?: 'v8' | 'istanbul' | 'custom';
    setupFile?: string;
    useEsmExtension?: boolean;
    port?: number;
    previewPort?: number;
}
export declare function createOrEditViteConfig(tree: Tree, options: ViteConfigFileOptions, onlyVitest: boolean, extraOptions?: {
    projectAlreadyHasViteTargets?: TargetFlags;
    skipPackageJson?: boolean;
    vitestFileName?: boolean;
}): void;
//# sourceMappingURL=generator-utils.d.ts.map