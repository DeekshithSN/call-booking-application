import { ExecutorContext } from '@nx/devkit';
/**
 * Returns the path to the vite config file or undefined when not found.
 */
export declare function normalizeViteConfigFilePath(contextRoot: string, projectRoot: string, configFile?: string): string | undefined;
export declare function getProjectTsConfigPath(projectRoot: string): string | undefined;
export declare function getNxTargetOptions(target: string, context: ExecutorContext): any;
//# sourceMappingURL=options-utils.d.ts.map