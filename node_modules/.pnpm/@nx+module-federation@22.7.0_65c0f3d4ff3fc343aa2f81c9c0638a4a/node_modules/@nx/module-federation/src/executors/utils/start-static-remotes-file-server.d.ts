import { type ExecutorContext } from '@nx/devkit';
import { type StaticRemotesOptions } from './models';
import type { StaticRemotesConfig } from '../../utils';
export declare function startStaticRemotesFileServer(staticRemotesConfig: StaticRemotesConfig, context: ExecutorContext, options: StaticRemotesOptions, forceMoveToCommonLocation?: boolean): AsyncGenerator<{
    success: boolean;
    baseUrl: string;
}, {
    success: boolean;
}, unknown>;
export declare function startSsrStaticRemotesFileServer(staticRemotesConfig: StaticRemotesConfig, context: ExecutorContext, options: StaticRemotesOptions): AsyncGenerator<{
    success: boolean;
    baseUrl: string;
} | {
    success: boolean;
}, void, unknown>;
//# sourceMappingURL=start-static-remotes-file-server.d.ts.map