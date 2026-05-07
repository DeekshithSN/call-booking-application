import { type Tree, type GeneratorCallback } from '@nx/devkit';
import { InitGeneratorSchema } from './schema';
export declare function updateDependencies(tree: Tree, schema: InitGeneratorSchema): GeneratorCallback;
export declare function initGenerator(tree: Tree, schema: InitGeneratorSchema): Promise<GeneratorCallback>;
export default initGenerator;
//# sourceMappingURL=init.d.ts.map