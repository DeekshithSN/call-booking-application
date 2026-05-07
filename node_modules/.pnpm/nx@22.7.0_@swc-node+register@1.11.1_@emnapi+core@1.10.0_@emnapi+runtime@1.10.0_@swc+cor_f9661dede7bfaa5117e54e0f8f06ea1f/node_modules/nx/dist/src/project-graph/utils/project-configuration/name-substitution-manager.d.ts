import { ProjectConfiguration } from '../../../config/workspace-json-project-json';
/**
 * Manages deferred project name substitutions across the plugin result
 * merge phase of project graph construction.
 *
 * ### Why this exists
 *
 * When plugins return `createNodes` results, a node `A` may declare a
 * `dependsOn` or `inputs` entry that references another project `B` by
 * name. A *later* plugin is allowed to rename project `B` to `C`. After
 * all plugin results are merged into the root map, node `A` would still
 * hold a stale reference to the now-nonexistent name `B`.
 *
 * This class solves that by:
 * 1. Receiving a live nameMap accessor (maintained by ProjectNodesManager)
 *    for name → root resolution and colon-delimited string parsing.
 * 2. Tracking dirty roots via {@link identifyProjectWithRoot} when a
 *    project name changes at a root.
 * 3. Scanning each plugin's results for project-name references in
 *    `inputs` and `dependsOn` ({@link registerSubstitutorsForNodeResults}).
 * 4. After all results are merged, applying the substitutors for every
 *    renamed project so that references are updated to the final name
 *    ({@link applySubstitutions}).
 */
export declare class ProjectNameInNodePropsManager {
    private substitutorsByReferencedRoot;
    private substitutorsByArrayKey;
    private pendingSubstitutorsByName;
    private dirtyRoots;
    private getNameMap;
    constructor(getNameMap?: () => Record<string, ProjectConfiguration>);
    private removeSubstitutorEntry;
    private clearSubstitutorAtIndex;
    private clearSubstitutorsFromIndex;
    private clearSubstitutorsFromSubIndex;
    private forEachTargetConfig;
    private registerProjectNameSubstitutor;
    /**
     * Scans `pluginResultProjects` for `inputs` and `dependsOn` entries that
     * reference another project by name, and registers substitutors so those
     * references are updated if the target project is later renamed.
     *
     * **Important**: call {@link identifyProjectWithRoot} for all projects in
     * this result (and all prior results) before calling this method, so that
     * referenced project names can be resolved to roots.
     *
     * @param pluginResultProjects Projects from a single plugin's createNodes call.
     */
    registerSubstitutorsForNodeResults(pluginResultProjects?: Record<string, Omit<ProjectConfiguration, 'root'> & Partial<ProjectConfiguration>>): void;
    private createInputsStringSubstitutor;
    private createInputsArraySubstitutor;
    private createDependsOnStringSubstitutor;
    private createDependsOnArraySubstitutor;
    private createDependsOnTargetStringSubstitutor;
    private registerSubstitutorsForInputs;
    private registerSubstitutorsForDependsOn;
    /**
     * Records that a project with `name` exists at the given `root`. Call
     * this during the merge phase whenever a project's name changes at a
     * root — **before** calling
     * {@link registerSubstitutorsForNodeResults} for that result.
     *
     * The nameMap (maintained externally by ProjectNodesManager) is always
     * current — this method only needs to mark the root as dirty and
     * promote any pending substitutors keyed by name.
     */
    identifyProjectWithRoot(root: string, name: string): void;
    /**
     * Executes all registered substitutors for renamed projects, updating
     * stale project name references in the final merged `rootMap`. Should be
     * called once after all plugin results have been merged.
     */
    applySubstitutions(rootMap: Record<string, ProjectConfiguration>): void;
}
