import { GeneratorCallback, Tree } from '@nx/devkit';
export interface LintWorkspaceRuleGeneratorOptions {
    name: string;
    directory: string;
}
export declare function lintWorkspaceRuleGenerator(tree: Tree, options: LintWorkspaceRuleGeneratorOptions): Promise<GeneratorCallback>;
//# sourceMappingURL=workspace-rule.d.ts.map