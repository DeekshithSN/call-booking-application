import { ProjectGraph } from '@nx/devkit';
import { ModuleFederationConfig } from '../../utils';
export declare function getRemotes(config: ModuleFederationConfig, projectGraph: ProjectGraph, pathToManifestFile?: string): {
    remotes: string[];
    remotePorts: any[];
    staticRemotePort: number;
};
//# sourceMappingURL=get-remotes.d.ts.map