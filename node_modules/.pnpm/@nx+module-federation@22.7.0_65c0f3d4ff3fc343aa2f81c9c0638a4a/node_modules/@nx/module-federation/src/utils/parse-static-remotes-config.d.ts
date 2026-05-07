import { ExecutorContext } from '@nx/devkit';
export type StaticRemoteConfig = {
    basePath: string;
    outputPath: string;
    urlSegment: string;
    port: number;
};
export type StaticRemotesConfig = {
    remotes: string[];
    config: Record<string, StaticRemoteConfig> | undefined;
};
export declare function parseStaticRemotesConfig(staticRemotes: string[] | undefined, context: ExecutorContext): StaticRemotesConfig;
export declare function parseStaticSsrRemotesConfig(staticRemotes: string[] | undefined, context: ExecutorContext): StaticRemotesConfig;
//# sourceMappingURL=parse-static-remotes-config.d.ts.map