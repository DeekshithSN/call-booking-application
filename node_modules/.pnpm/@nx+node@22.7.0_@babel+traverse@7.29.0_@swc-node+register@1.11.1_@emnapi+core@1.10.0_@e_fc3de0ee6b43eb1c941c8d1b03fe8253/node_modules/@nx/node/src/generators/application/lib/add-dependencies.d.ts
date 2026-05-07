import { GeneratorCallback, Tree } from '@nx/devkit';
import { NormalizedSchema } from './normalized-schema';
export declare function addProjectDependencies(tree: Tree, options: NormalizedSchema): {
    installTask: GeneratorCallback;
    frameworkDependencies: Record<string, string>;
};
//# sourceMappingURL=add-dependencies.d.ts.map