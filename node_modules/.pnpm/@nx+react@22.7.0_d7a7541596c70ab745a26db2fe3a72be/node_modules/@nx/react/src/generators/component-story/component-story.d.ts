import { Tree } from '@nx/devkit';
import type * as ts from 'typescript';
export interface CreateComponentStoriesFileSchema {
    project: string;
    componentPath: string;
    interactionTests?: boolean;
    uiFramework?: string;
    skipFormat?: boolean;
}
export declare function createComponentStoriesFile(host: Tree, { project, componentPath, interactionTests, uiFramework, }: CreateComponentStoriesFileSchema): void;
export declare function findPropsAndGenerateFile(host: Tree, sourceFile: ts.SourceFile, cmpDeclaration: ts.Node, componentDirectory: string, name: string, interactionTests: boolean, uiFramework: string, isPlainJs: boolean, fromNodeArray?: boolean): void;
export declare function componentStoryGenerator(host: Tree, schema: CreateComponentStoriesFileSchema): Promise<void>;
export default componentStoryGenerator;
//# sourceMappingURL=component-story.d.ts.map