import { NxJsonConfiguration } from '../../config/nx-json';
import { ProjectGraphExternalNode } from '../../config/project-graph';
import { ProjectConfiguration } from '../../config/workspace-json-project-json';
import { AggregateCreateNodesError, MergeNodesError, MultipleProjectsWithSameNameError, ProjectsWithNoNameError, WorkspaceValidityError } from '../error-types';
import type { LoadedNxPlugin } from '../plugins/loaded-nx-plugin';
import { CreateNodesResult } from '../plugins/public-api';
import type { ConfigurationSourceMaps, SourceInformation } from './project-configuration/source-maps';
export { mergeTargetConfigurations, readTargetDefaultsForTarget, } from './project-configuration/target-merging';
export type ConfigurationResult = {
    /**
     * A map of project configurations, keyed by project root.
     */
    projects: {
        [projectRoot: string]: ProjectConfiguration;
    };
    /**
     * Node Name -> Node info
     */
    externalNodes: Record<string, ProjectGraphExternalNode>;
    /**
     * Project Root -> Project Name
     */
    projectRootMap: Record<string, string>;
    sourceMaps: ConfigurationSourceMaps;
    /**
     * The list of files that were used to create project configurations
     */
    matchingProjectFiles: string[];
};
/**
 * Transforms a list of project paths into a map of project configurations.
 *
 * @param root The workspace root
 * @param nxJson The NxJson configuration
 * @param workspaceFiles A list of non-ignored workspace files
 * @param plugins The plugins that should be used to infer project configuration
 */
export declare function createProjectConfigurationsWithPlugins(root: string, nxJson: NxJsonConfiguration, projectFiles: string[][], // making this parameter allows devkit to pick up newly created projects
plugins: LoadedNxPlugin[]): Promise<ConfigurationResult>;
export declare function mergeCreateNodesResults(results: (readonly [
    plugin: string,
    file: string,
    result: CreateNodesResult,
    pluginIndex?: number
])[][], nxJsonConfiguration: NxJsonConfiguration, workspaceRoot: string, errors: (AggregateCreateNodesError | MergeNodesError | ProjectsWithNoNameError | MultipleProjectsWithSameNameError | WorkspaceValidityError)[]): {
    projectRootMap: Record<string, ProjectConfiguration>;
    externalNodes: Record<string, ProjectGraphExternalNode>;
    rootMap: Record<string, string>;
    configurationSourceMaps: Record<string, Record<string, SourceInformation>>;
};
export declare function findMatchingConfigFiles(projectFiles: string[], pattern: string, include: string[], exclude: string[]): string[];
