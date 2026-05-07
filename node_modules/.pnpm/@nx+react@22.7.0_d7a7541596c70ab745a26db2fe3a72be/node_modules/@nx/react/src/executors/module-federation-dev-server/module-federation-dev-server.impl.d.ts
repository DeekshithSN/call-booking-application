import { ExecutorContext } from '@nx/devkit';
import { ModuleFederationDevServerOptions } from './schema';
export default function moduleFederationDevServer(schema: ModuleFederationDevServerOptions, context: ExecutorContext): AsyncIterableIterator<{
    success: boolean;
    baseUrl?: string;
}>;
//# sourceMappingURL=module-federation-dev-server.impl.d.ts.map