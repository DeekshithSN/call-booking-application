import { GeneratorCallback, Tree } from '@nx/devkit';
import { SetUpDockerOptions } from './schema';
export declare function updateProjectConfig(tree: Tree, options: SetUpDockerOptions): void;
export declare function setupDockerGenerator(tree: Tree, setupOptions: SetUpDockerOptions): Promise<GeneratorCallback>;
export default setupDockerGenerator;
//# sourceMappingURL=setup-docker.d.ts.map