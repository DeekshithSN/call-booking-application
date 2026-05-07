import { Tree } from '@nx/devkit';
export interface VSCodeDebugConfigOptions {
    projectName: string;
    projectRoot: string;
    packageManager?: string;
}
export declare function addVSCodeDebugConfiguration(tree: Tree, options: VSCodeDebugConfigOptions): void;
//# sourceMappingURL=vscode-debug-config.d.ts.map