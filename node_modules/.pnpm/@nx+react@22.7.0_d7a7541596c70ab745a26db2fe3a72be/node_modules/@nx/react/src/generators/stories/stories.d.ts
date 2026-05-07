import { ProjectConfiguration, Tree } from '@nx/devkit';
export interface StorybookStoriesSchema {
    project: string;
    interactionTests?: boolean;
    js?: boolean;
    ignorePaths?: string[];
    uiFramework?: string;
    skipFormat?: boolean;
}
export declare function projectRootPath(tree: Tree, config: ProjectConfiguration): Promise<string>;
export declare function containsComponentDeclaration(tree: Tree, componentPath: string): boolean;
export declare function createAllStories(tree: Tree, schema: StorybookStoriesSchema, projectConfiguration: ProjectConfiguration): Promise<void>;
export declare function storiesGenerator(host: Tree, schema: StorybookStoriesSchema): Promise<void>;
export default storiesGenerator;
//# sourceMappingURL=stories.d.ts.map