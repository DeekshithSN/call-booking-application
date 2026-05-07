import { GeneratorCallback, Tree } from '@nx/devkit';
import { Schema } from './schema';
export interface NormalizedSchema extends Schema {
    fileName: string;
    projectName: string;
    projectRoot: string;
    parsedTags: string[];
    compiler: 'swc' | 'tsc';
    isUsingTsSolutionConfig: boolean;
}
export declare function libraryGenerator(tree: Tree, schema: Schema): Promise<GeneratorCallback>;
export declare function libraryGeneratorInternal(tree: Tree, schema: Schema): Promise<GeneratorCallback>;
export default libraryGenerator;
//# sourceMappingURL=library.d.ts.map