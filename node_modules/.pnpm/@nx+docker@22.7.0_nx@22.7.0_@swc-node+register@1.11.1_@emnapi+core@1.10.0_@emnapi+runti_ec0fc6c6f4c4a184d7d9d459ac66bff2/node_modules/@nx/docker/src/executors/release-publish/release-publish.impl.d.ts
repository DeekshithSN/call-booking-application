import { type ExecutorContext } from '@nx/devkit';
import type { DockerReleasePublishSchema } from './schema';
export interface NormalizedDockerReleasePublishSchema {
    quiet: boolean;
    imageReference: string;
    dryRun: boolean;
}
export declare const LARGE_BUFFER: number;
export default function dockerReleasePublish(schema: DockerReleasePublishSchema, context: ExecutorContext): Promise<{
    success: boolean;
}>;
//# sourceMappingURL=release-publish.impl.d.ts.map