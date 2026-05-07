import { Tree } from '@nx/devkit';
import type { GeneratorCallback } from '@nx/devkit';
import { CypressComponentConfigurationSchema } from './schema.d';
export declare function cypressComponentConfigGenerator(tree: Tree, options: CypressComponentConfigurationSchema): Promise<GeneratorCallback>;
/**
 * This is for using cypresses own Component testing, if you want to use test
 * storybook components then use componentCypressGenerator instead.
 *
 */
export declare function cypressComponentConfigGeneratorInternal(tree: Tree, options: CypressComponentConfigurationSchema): Promise<GeneratorCallback>;
export default cypressComponentConfigGenerator;
//# sourceMappingURL=cypress-component-configuration.d.ts.map