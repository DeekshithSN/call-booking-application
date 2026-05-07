import { ProjectGraphProjectNode } from '@nx/devkit';
import type { FinalConfigForProject } from 'nx/src/command-line/release/utils/release-graph';
export declare const getDockerVersionPath: (workspaceRoot: string, projectRoot: string) => string;
export declare function handleDockerVersion(workspaceRoot: string, projectGraphNode: ProjectGraphProjectNode, finalConfigForProject: FinalConfigForProject, dockerVersionScheme?: string, dockerVersion?: string, versionActionsVersion?: string): Promise<{
    newVersion: string;
    logs: string[];
}>;
//# sourceMappingURL=version-utils.d.ts.map