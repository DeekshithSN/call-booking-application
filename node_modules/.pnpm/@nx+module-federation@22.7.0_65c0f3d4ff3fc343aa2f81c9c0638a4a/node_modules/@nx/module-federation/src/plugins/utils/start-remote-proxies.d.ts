import { StaticRemoteConfig } from '../../utils';
export declare function startRemoteProxies(staticRemotesConfig: Record<string, StaticRemoteConfig>, mappedLocationsOfRemotes: Record<string, string>, sslOptions?: {
    pathToCert: string;
    pathToKey: string;
}, isServer?: boolean, host?: string): Promise<void>;
//# sourceMappingURL=start-remote-proxies.d.ts.map