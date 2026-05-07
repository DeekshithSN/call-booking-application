"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectNameInNodePropsManager = void 0;
const globs_1 = require("../../../utils/globs");
const split_target_1 = require("../../../utils/split-target");
const minimatch_1 = require("minimatch");
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
class ProjectNameInNodePropsManager {
    constructor(getNameMap) {
        // Maps the *root of the referenced project* → set of substitutor entries
        // that should run when that project is renamed. Keying by root (not name)
        // ensures that when project "A" is renamed to "B" and a *new* project
        // takes the name "A" at a different root, references to the new "A" are
        // not incorrectly rewritten.
        this.substitutorsByReferencedRoot = new Map();
        // Tracks substitutor entries by (array path, index, subIndex). This
        // serves two purposes:
        //
        // 1. Per-index deduplication: if the same array index is registered
        //    again (e.g. two plugin results contribute to the same position),
        //    the old substitutor is evicted before the new one is added.
        //
        // 2. Tail-clearing: when a later plugin provides a shorter array at the
        //    same path, splice removes all tail entries in one call.
        //
        // Outer key: array path (e.g. "proj-a:targets.build.inputs")
        // Inner array: indexed by position; each slot holds an array so that a
        //   single `projects` array can hold multiple name references.
        this.substitutorsByArrayKey = new Map();
        // Holds substitutors for project names that haven't been identified yet
        // (forward references). When identifyProjectWithRoot is later called for
        // a name in this map, the entries are promoted to substitutorsByReferencedRoot.
        this.pendingSubstitutorsByName = new Map();
        // Roots of projects whose names changed during the merge phase.
        this.dirtyRoots = new Set();
        this.getNameMap = getNameMap ?? (() => ({}));
    }
    removeSubstitutorEntry(item) {
        if (item.referencedRoot !== undefined) {
            const substitutors = this.substitutorsByReferencedRoot.get(item.referencedRoot);
            if (substitutors) {
                substitutors.delete(item.entry);
                if (substitutors.size === 0) {
                    this.substitutorsByReferencedRoot.delete(item.referencedRoot);
                }
            }
        }
        if (item.referencedName !== undefined) {
            const substitutors = this.pendingSubstitutorsByName.get(item.referencedName);
            if (substitutors) {
                substitutors.delete(item.entry);
                if (substitutors.size === 0) {
                    this.pendingSubstitutorsByName.delete(item.referencedName);
                }
            }
        }
    }
    // Removes the substitutor registered at the given index (and optional
    // subIndex) of an array, if any. Used when re-registering for the same
    // position (overwritten by a later plugin).
    clearSubstitutorAtIndex(arrayKey, index, subIndex) {
        const byIndex = this.substitutorsByArrayKey.get(arrayKey);
        const atIndex = byIndex?.[index];
        if (!atIndex) {
            return;
        }
        if (subIndex === undefined) {
            // Clear the entire index entry (single project reference)
            for (const item of atIndex) {
                if (item) {
                    this.removeSubstitutorEntry(item);
                }
            }
            byIndex[index] = undefined;
        }
        else {
            // Clear only the specific subIndex (within a projects array)
            const existing = atIndex[subIndex];
            if (existing) {
                this.removeSubstitutorEntry(existing);
                atIndex[subIndex] = undefined;
            }
        }
    }
    // Removes all substitutors at indices >= `fromIndex` for the given array
    // path. Uses splice so the tail is dropped in one operation.
    clearSubstitutorsFromIndex(arrayKey, fromIndex) {
        const byIndex = this.substitutorsByArrayKey.get(arrayKey);
        if (!byIndex) {
            return;
        }
        const removed = byIndex.splice(fromIndex);
        for (const atIndex of removed) {
            if (atIndex) {
                for (const item of atIndex) {
                    if (item) {
                        this.removeSubstitutorEntry(item);
                    }
                }
            }
        }
    }
    // Removes all substitutors at sub-indices >= `fromSubIndex` for one
    // specific array index of the given array key.
    clearSubstitutorsFromSubIndex(arrayKey, index, fromSubIndex) {
        const byIndex = this.substitutorsByArrayKey.get(arrayKey);
        const atIndex = byIndex?.[index];
        if (!atIndex) {
            return;
        }
        const removed = atIndex.splice(fromSubIndex);
        for (const item of removed) {
            if (item) {
                this.removeSubstitutorEntry(item);
            }
        }
        let hasAnyItem = false;
        for (const item of atIndex) {
            if (item) {
                hasAnyItem = true;
                break;
            }
        }
        if (!hasAnyItem) {
            byIndex[index] = undefined;
        }
    }
    forEachTargetConfig(ownerConfig, targetName, callback) {
        const ownerTargets = ownerConfig.targets;
        if (!ownerTargets) {
            return;
        }
        const exactMatch = ownerTargets[targetName];
        if (exactMatch && typeof exactMatch === 'object') {
            callback(exactMatch);
            return;
        }
        if (!(0, globs_1.isGlobPattern)(targetName)) {
            return;
        }
        for (const candidateTargetName in ownerTargets) {
            if (!(0, minimatch_1.minimatch)(candidateTargetName, targetName)) {
                continue;
            }
            const targetConfig = ownerTargets[candidateTargetName];
            if (!targetConfig || typeof targetConfig !== 'object') {
                continue;
            }
            callback(targetConfig);
        }
    }
    // Registers a new substitutor for `referencedName`, tracked at
    // (arrayKey, index, subIndex) for deduplication and tail-clearing.
    // The substitutor is keyed by root when the referenced project is
    // already in the nameMap, otherwise parked in pendingSubstitutorsByName.
    registerProjectNameSubstitutor(referencedName, ownerRoot, arrayKey, index, substitutor, subIndex) {
        // Evict any existing substitutor at this exact position first.
        this.clearSubstitutorAtIndex(arrayKey, index, subIndex);
        const entry = { ownerRoot, substitutor };
        const nameMap = this.getNameMap();
        const referencedRoot = nameMap[referencedName]?.root;
        let trackingItem;
        if (referencedRoot !== undefined) {
            // Project is already known — key directly by root.
            let substitutorsForRoot = this.substitutorsByReferencedRoot.get(referencedRoot);
            if (!substitutorsForRoot) {
                substitutorsForRoot = new Set();
                this.substitutorsByReferencedRoot.set(referencedRoot, substitutorsForRoot);
            }
            substitutorsForRoot.add(entry);
            trackingItem = { referencedRoot, entry };
        }
        else {
            // Forward reference — park in pending map keyed by name.
            let pendingSet = this.pendingSubstitutorsByName.get(referencedName);
            if (!pendingSet) {
                pendingSet = new Set();
                this.pendingSubstitutorsByName.set(referencedName, pendingSet);
            }
            pendingSet.add(entry);
            trackingItem = { referencedName, entry };
        }
        let byIndex = this.substitutorsByArrayKey.get(arrayKey);
        if (!byIndex) {
            byIndex = [];
            this.substitutorsByArrayKey.set(arrayKey, byIndex);
        }
        if (subIndex === undefined) {
            byIndex[index] = [trackingItem];
        }
        else {
            if (!byIndex[index]) {
                byIndex[index] = [];
            }
            const subArray = byIndex[index];
            subArray[subIndex] = trackingItem;
        }
    }
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
    registerSubstitutorsForNodeResults(pluginResultProjects) {
        if (!pluginResultProjects) {
            return;
        }
        for (const ownerRoot in pluginResultProjects) {
            const project = pluginResultProjects[ownerRoot];
            if (!project.targets) {
                continue;
            }
            for (const targetName in project.targets) {
                const targetConfig = project.targets[targetName];
                if (!targetConfig || typeof targetConfig !== 'object') {
                    continue;
                }
                if (Array.isArray(targetConfig.inputs)) {
                    this.registerSubstitutorsForInputs(ownerRoot, targetName, targetConfig.inputs);
                }
                if (Array.isArray(targetConfig.dependsOn)) {
                    this.registerSubstitutorsForDependsOn(ownerRoot, targetName, targetConfig.dependsOn, project.targets, project.name);
                }
            }
        }
    }
    // Factory methods for creating substitutors. Using factory functions
    // ensures that index variables (i, j) are captured as function parameters
    // (always by value), preventing closure-over-loop-variable bugs.
    createInputsStringSubstitutor(targetName, i) {
        return (finalName, ownerConfig) => {
            this.forEachTargetConfig(ownerConfig, targetName, (targetConfig) => {
                const finalInput = targetConfig.inputs?.[i];
                if (finalInput &&
                    typeof finalInput === 'object' &&
                    'projects' in finalInput) {
                    finalInput.projects = finalName;
                }
            });
        };
    }
    createInputsArraySubstitutor(targetName, i, j) {
        return (finalName, ownerConfig) => {
            this.forEachTargetConfig(ownerConfig, targetName, (targetConfig) => {
                const finalInput = targetConfig.inputs?.[i];
                if (finalInput &&
                    typeof finalInput === 'object' &&
                    'projects' in finalInput) {
                    finalInput['projects'][j] = finalName;
                }
            });
        };
    }
    createDependsOnStringSubstitutor(targetName, i) {
        return (finalName, ownerConfig) => {
            this.forEachTargetConfig(ownerConfig, targetName, (targetConfig) => {
                const finalDep = targetConfig.dependsOn?.[i];
                if (finalDep &&
                    typeof finalDep === 'object' &&
                    'projects' in finalDep) {
                    finalDep.projects = finalName;
                }
            });
        };
    }
    createDependsOnArraySubstitutor(targetName, i, j) {
        return (finalName, ownerConfig) => {
            this.forEachTargetConfig(ownerConfig, targetName, (targetConfig) => {
                const finalDep = targetConfig.dependsOn?.[i];
                if (finalDep &&
                    typeof finalDep === 'object' &&
                    'projects' in finalDep) {
                    finalDep['projects'][j] = finalName;
                }
            });
        };
    }
    createDependsOnTargetStringSubstitutor(targetName, i, targetPart) {
        return (finalName, ownerConfig) => {
            this.forEachTargetConfig(ownerConfig, targetName, (targetConfig) => {
                const finalDep = targetConfig.dependsOn?.[i];
                if (typeof finalDep === 'string') {
                    targetConfig.dependsOn[i] =
                        `${finalName}:${targetPart}`;
                }
            });
        };
    }
    registerSubstitutorsForInputs(ownerRoot, targetName, inputs) {
        const arrayKey = `${ownerRoot}:targets.${targetName}.inputs`;
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (typeof input !== 'object' || !('projects' in input)) {
                continue;
            }
            const inputProjectNames = input['projects'];
            if (typeof inputProjectNames === 'string') {
                // `self` and `dependencies` are keywords, not project names.
                if (inputProjectNames === 'self' ||
                    inputProjectNames === 'dependencies') {
                    continue;
                }
                this.registerProjectNameSubstitutor(inputProjectNames, ownerRoot, arrayKey, i, this.createInputsStringSubstitutor(targetName, i));
            }
            else if (Array.isArray(inputProjectNames)) {
                for (let j = 0; j < inputProjectNames.length; j++) {
                    const projectName = inputProjectNames[j];
                    this.registerProjectNameSubstitutor(projectName, ownerRoot, arrayKey, i, this.createInputsArraySubstitutor(targetName, i, j), j // subIndex for array elements
                    );
                }
                // Clear stale sub-indices if a later plugin shrinks the array.
                this.clearSubstitutorsFromSubIndex(arrayKey, i, inputProjectNames.length);
            }
        }
        // Evict any dangling substitutors at indices beyond the new array length —
        // the array may have shrunk compared to a previous plugin's contribution.
        this.clearSubstitutorsFromIndex(arrayKey, inputs.length);
    }
    registerSubstitutorsForDependsOn(ownerRoot, targetName, dependsOn, ownerTargets, ownerProjectName) {
        const arrayKey = `${ownerRoot}:targets.${targetName}.dependsOn`;
        for (let i = 0; i < dependsOn.length; i++) {
            const dep = dependsOn[i];
            if (typeof dep === 'string') {
                // String-form dependsOn entries like "project:target". Strings
                // starting with '^' are dependency-mode references (no project
                // name). Use splitTargetFromConfigurations with the nameMap to
                // properly handle project / target names containing colons.
                //
                // However, if the string matches a target name in the owning
                // project, it is a same-project target reference (e.g. a target
                // literally named "nx:echo"), not a cross-project reference.
                if (!dep.startsWith('^') && !(ownerTargets && dep in ownerTargets)) {
                    const [maybeProject, ...rest] = (0, split_target_1.splitTargetFromConfigurations)(dep, this.getNameMap(), { silent: true, currentProject: ownerProjectName });
                    if (rest.length > 0) {
                        const targetPart = rest.join(':');
                        this.registerProjectNameSubstitutor(maybeProject, ownerRoot, arrayKey, i, this.createDependsOnTargetStringSubstitutor(targetName, i, targetPart));
                    }
                }
                continue;
            }
            if (typeof dep !== 'object' || !dep.projects) {
                continue;
            }
            const depProjects = dep.projects;
            if (typeof depProjects === 'string') {
                // `*`, `self`, and `dependencies` are keywords, not project names.
                if (['*', 'self', 'dependencies'].includes(depProjects)) {
                    continue;
                }
                this.registerProjectNameSubstitutor(depProjects, ownerRoot, arrayKey, i, this.createDependsOnStringSubstitutor(targetName, i));
            }
            else if (Array.isArray(depProjects)) {
                // Glob patterns can match multiple projects and can't be resolved
                // to a single project name at this stage, so we skip them.
                for (let j = 0; j < depProjects.length; j++) {
                    const projectName = depProjects[j];
                    if ((0, globs_1.isGlobPattern)(projectName)) {
                        continue;
                    }
                    this.registerProjectNameSubstitutor(projectName, ownerRoot, arrayKey, i, this.createDependsOnArraySubstitutor(targetName, i, j), j // subIndex for array elements
                    );
                }
                // Clear stale sub-indices if a later plugin shrinks the array.
                this.clearSubstitutorsFromSubIndex(arrayKey, i, depProjects.length);
            }
        }
        // Evict any dangling substitutors at indices beyond the new array length —
        // the array may have shrunk compared to a previous plugin's contribution.
        this.clearSubstitutorsFromIndex(arrayKey, dependsOn.length);
    }
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
    identifyProjectWithRoot(root, name) {
        // Always mark dirty when called — the caller only invokes this when
        // the name actually changed at this root (first identification or
        // rename). If there are pending substitutors for this name, those
        // forward refs need updating. If it's a rename, existing refs need
        // updating. Either way, the root is dirty.
        this.dirtyRoots.add(root);
        // Promote any pending substitutors that were waiting for this name.
        const pending = this.pendingSubstitutorsByName.get(name);
        if (pending) {
            this.pendingSubstitutorsByName.delete(name);
            let substitutorsForRoot = this.substitutorsByReferencedRoot.get(root);
            if (!substitutorsForRoot) {
                substitutorsForRoot = new Set();
                this.substitutorsByReferencedRoot.set(root, substitutorsForRoot);
            }
            for (const entry of pending) {
                substitutorsForRoot.add(entry);
            }
            // Update tracking items to reflect the promotion from name → root.
            for (const [, byIndex] of this.substitutorsByArrayKey) {
                for (const atIndex of byIndex) {
                    if (!atIndex)
                        continue;
                    for (const item of atIndex) {
                        if (item &&
                            item.referencedName === name &&
                            pending.has(item.entry)) {
                            item.referencedName = undefined;
                            item.referencedRoot = root;
                        }
                    }
                }
            }
        }
    }
    /**
     * Executes all registered substitutors for renamed projects, updating
     * stale project name references in the final merged `rootMap`. Should be
     * called once after all plugin results have been merged.
     */
    applySubstitutions(rootMap) {
        for (const root of this.dirtyRoots) {
            const finalName = rootMap[root]?.name;
            if (!finalName) {
                continue;
            }
            const substitutors = this.substitutorsByReferencedRoot.get(root);
            if (!substitutors) {
                continue;
            }
            for (const { ownerRoot, substitutor } of substitutors) {
                const ownerConfig = rootMap[ownerRoot];
                if (ownerConfig) {
                    substitutor(finalName, ownerConfig);
                }
            }
        }
    }
}
exports.ProjectNameInNodePropsManager = ProjectNameInNodePropsManager;
