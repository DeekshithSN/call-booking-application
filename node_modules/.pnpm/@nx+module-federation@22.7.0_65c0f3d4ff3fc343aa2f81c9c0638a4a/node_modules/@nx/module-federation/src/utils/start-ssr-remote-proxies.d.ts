import type { StaticRemotesConfig } from './parse-static-remotes-config';
export declare function startSsrRemoteProxies(staticRemotesConfig: StaticRemotesConfig, mappedLocationsOfRemotes: Record<string, string>, sslOptions?: {
    pathToCert: string;
    pathToKey: string;
}, host?: string): Promise<void>;
//# sourceMappingURL=start-ssr-remote-proxies.d.ts.map