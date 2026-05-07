import { GeneratorCallback, Tree } from '@nx/devkit';
import { VitestGeneratorSchema } from './schema';
/**
 * @param hasPlugin some frameworks (e.g. Nuxt) provide their own plugin. Their generators handle the plugin detection.
 */
export declare function configurationGenerator(tree: Tree, schema: VitestGeneratorSchema, hasPlugin?: boolean): Promise<GeneratorCallback>;
export declare function configurationGeneratorInternal(tree: Tree, schema: VitestGeneratorSchema, hasPlugin?: boolean): Promise<GeneratorCallback>;
export default configurationGenerator;
//# sourceMappingURL=configuration.d.ts.map