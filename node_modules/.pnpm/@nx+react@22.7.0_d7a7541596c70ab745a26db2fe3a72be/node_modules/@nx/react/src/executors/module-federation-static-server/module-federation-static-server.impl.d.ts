import { StaticRemotesConfig } from '@nx/module-federation/src/utils';
import { ExecutorContext } from 'nx/src/config/misc-interfaces';
import { ModuleFederationDevServerOptions } from '../module-federation-dev-server/schema';
import { ModuleFederationStaticServerSchema } from './schema';
export declare function startProxies(staticRemotesConfig: StaticRemotesConfig, hostServeOptions: ModuleFederationDevServerOptions, mappedLocationOfHost: string, mappedLocationsOfRemotes: Record<string, string>, sslOptions?: {
    pathToCert: string;
    pathToKey: string;
}): void;
export default function moduleFederationStaticServer(schema: ModuleFederationStaticServerSchema, context: ExecutorContext): AsyncGenerator<{
    success: boolean;
    baseUrl: string;
}, any, any>;
//# sourceMappingURL=module-federation-static-server.impl.d.ts.map