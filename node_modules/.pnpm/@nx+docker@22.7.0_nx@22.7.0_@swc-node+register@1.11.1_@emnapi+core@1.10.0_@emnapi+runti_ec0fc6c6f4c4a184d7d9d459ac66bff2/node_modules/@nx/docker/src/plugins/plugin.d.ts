import { type CreateNodesV2 } from '@nx/devkit';
export interface DockerTargetOptions {
    name: string;
    args?: string[];
    env?: Record<string, string>;
    envFile?: string;
    cwd?: string;
    /**
     * Skip adding the default `--tag` argument to the Docker build command.
     * When set to `true`, you must provide your own tag via the `args` property.
     *
     * **Important:** Setting this to `true` opts out of Nx Release support for this project.
     * The automatic versioning and publishing features of `nx release` will not work
     * with Docker projects that have `skipDefaultTag` enabled.
     *
     * @default false
     */
    skipDefaultTag?: boolean;
    configurations?: Record<string, Omit<DockerTargetOptions, 'configurations' | 'name'>>;
}
export interface DockerPluginOptions {
    buildTarget?: string | DockerTargetOptions;
    runTarget?: string | DockerTargetOptions;
}
export declare const createNodesV2: CreateNodesV2<DockerPluginOptions>;
export declare function getProjectNameFromPath(projectRoot: string, workspaceRoot: string): string;
//# sourceMappingURL=plugin.d.ts.map