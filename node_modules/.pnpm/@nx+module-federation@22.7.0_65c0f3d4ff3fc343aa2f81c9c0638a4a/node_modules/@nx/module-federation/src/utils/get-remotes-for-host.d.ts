import { type ProjectConfiguration, type ProjectGraph } from '@nx/devkit';
import { ModuleFederationConfig } from './models';
interface ModuleFederationExecutorContext {
    projectName: string;
    projectGraph: ProjectGraph;
    root: string;
}
export declare function getBuildTargetNameFromMFDevServer(projectConfig: ProjectConfiguration, projectGraph: ProjectGraph): string;
export declare function getRemotes(devRemotes: string[], skipRemotes: string[], config: ModuleFederationConfig, context: ModuleFederationExecutorContext, pathToManifestFile?: string): {
    staticRemotes: string[];
    devRemotes: any[];
    dynamicRemotes: any[];
    remotePorts: number[];
    staticRemotePort: number;
};
export declare function getModuleFederationConfig(tsconfigPath: string | undefined, workspaceRoot: string, projectRoot: string, pluginName?: 'react' | 'angular'): any;
export {};
//# sourceMappingURL=get-remotes-for-host.d.ts.map