import { ProjectGraph } from '@nx/devkit';
import { StaticRemoteConfig } from '../../utils';
export declare function parseRemotesConfig(remotes: string[] | undefined, workspaceRoot: string, projectGraph: ProjectGraph, isServer?: boolean): {
    remotes: string[];
    config: Record<string, StaticRemoteConfig>;
};
//# sourceMappingURL=parse-remotes-config.d.ts.map