import { type GeneratorCallback, type Tree } from '@nx/devkit';
import type { StorybookConfigureSchema } from './schema';
export declare function storybookConfigurationGenerator(host: Tree, schema: StorybookConfigureSchema): Promise<GeneratorCallback>;
export declare function storybookConfigurationGeneratorInternal(host: Tree, schema: StorybookConfigureSchema): Promise<GeneratorCallback>;
export default storybookConfigurationGenerator;
//# sourceMappingURL=configuration.d.ts.map