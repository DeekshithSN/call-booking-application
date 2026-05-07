import { StartRemoteFn, type StartRemoteIteratorsOptions } from './models';
import { type ExecutorContext } from '@nx/devkit';
export declare function startRemoteIterators(options: StartRemoteIteratorsOptions, context: ExecutorContext, startRemoteFn: StartRemoteFn, pathToManifestFile: string | undefined, pluginName?: 'react' | 'angular', isServer?: boolean): Promise<{
    remotes: {
        staticRemotes: string[];
        devRemotes: any[];
        dynamicRemotes: any[];
        remotePorts: number[];
        staticRemotePort: number;
    };
    devRemoteIters: AsyncIterable<{
        success: boolean;
    }>[];
    staticRemotesIter: AsyncGenerator<{
        success: boolean;
        baseUrl: string;
    }, {
        success: boolean;
    }, unknown> | AsyncGenerator<{
        success: boolean;
        baseUrl: string;
    } | {
        success: boolean;
    }, void, unknown>;
}>;
//# sourceMappingURL=start-remote-iterators.d.ts.map