import { ProjectConfiguration, Tree, TargetConfiguration } from '@nx/devkit';
import { NormalizedSchema } from './normalized-schema';
export declare function getWebpackBuildConfig(tree: Tree, project: ProjectConfiguration, options: NormalizedSchema): TargetConfiguration;
export declare function getEsBuildConfig(tree: Tree, project: ProjectConfiguration, options: NormalizedSchema): TargetConfiguration;
export declare function getServeConfig(options: NormalizedSchema): TargetConfiguration;
export declare function getNestWebpackBuildConfig(project: ProjectConfiguration): TargetConfiguration;
export declare function getPruneTargets(buildTarget: string, outputPath: string): {
    prune: TargetConfiguration;
    'prune-lockfile': TargetConfiguration;
    'copy-workspace-modules': TargetConfiguration;
};
//# sourceMappingURL=create-targets.d.ts.map