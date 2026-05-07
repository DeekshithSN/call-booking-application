export interface NxModuleFederationDevServerConfig {
    host?: string;
    staticRemotesPort?: number;
    pathToManifestFile?: string;
    ssl?: boolean;
    sslCert?: string;
    sslKey?: string;
    parallel?: number;
    devRemoteFindOptions?: DevRemoteFindOptions;
}
export interface DevRemoteFindOptions {
    retries?: number;
    retryDelay?: number;
}
//# sourceMappingURL=index.d.ts.map