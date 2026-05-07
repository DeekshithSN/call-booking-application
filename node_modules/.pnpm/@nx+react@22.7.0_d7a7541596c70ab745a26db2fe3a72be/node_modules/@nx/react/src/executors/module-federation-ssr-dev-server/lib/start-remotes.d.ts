import { ModuleFederationSsrDevServerOptions } from '../schema';
import { ExecutorContext, ProjectConfiguration } from '@nx/devkit';
export declare function startRemotes(remotes: string[], workspaceProjects: Record<string, ProjectConfiguration>, options: Partial<Pick<ModuleFederationSsrDevServerOptions, 'devRemotes' | 'host' | 'ssl' | 'sslCert' | 'sslKey' | 'verbose'>>, context: ExecutorContext): Promise<AsyncIterable<{
    success: boolean;
}>[]>;
//# sourceMappingURL=start-remotes.d.ts.map