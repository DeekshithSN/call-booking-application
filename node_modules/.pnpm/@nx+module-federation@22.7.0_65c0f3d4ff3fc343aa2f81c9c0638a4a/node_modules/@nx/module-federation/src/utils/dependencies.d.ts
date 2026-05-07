import type { ProjectGraph } from '@nx/devkit';
import type { WorkspaceLibrary } from './models';
export declare function getDependentPackagesForProject(projectGraph: ProjectGraph, name: string): {
    workspaceLibraries: WorkspaceLibrary[];
    npmPackages: string[];
};
//# sourceMappingURL=dependencies.d.ts.map