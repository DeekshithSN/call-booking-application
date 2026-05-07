import { StaticRemotesConfig } from './parse-static-remotes-config';
export declare function startRemoteProxies(staticRemotesConfig: StaticRemotesConfig, mappedLocationsOfRemotes: Record<string, string>, sslOptions?: {
    pathToCert: string;
    pathToKey: string;
}, host?: string): Promise<void>;
//# sourceMappingURL=start-remote-proxies.d.ts.map