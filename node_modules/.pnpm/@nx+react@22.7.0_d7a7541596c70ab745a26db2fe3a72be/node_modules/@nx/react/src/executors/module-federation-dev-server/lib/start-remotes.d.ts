import { ExecutorContext, ProjectConfiguration } from '@nx/devkit';
import { NormalizedModuleFederationDevServerOptions } from '../schema';
export declare function startRemotes(remotes: string[], workspaceProjects: Record<string, ProjectConfiguration>, options: Pick<NormalizedModuleFederationDevServerOptions, 'devRemotes' | 'host' | 'ssl' | 'sslCert' | 'sslKey' | 'verbose'>, context: ExecutorContext, target?: 'serve' | 'serve-static'): Promise<AsyncIterable<{
    success: boolean;
}>[]>;
//# sourceMappingURL=start-remotes.d.ts.map