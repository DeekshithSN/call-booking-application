import type { Plugin } from 'rollup';
import type { PackageJson } from 'nx/src/utils/package-json';
export interface GeneratePackageJsonOptions {
    outputPath: string;
    main: string;
    format: string[];
    generateExportsField?: boolean;
    skipTypeField?: boolean;
    outputFileName?: string;
    additionalEntryPoints?: string[];
}
export declare const pluginName = "rollup-plugin-nx-generate-package-json";
export declare function generatePackageJson(options: GeneratePackageJsonOptions, packageJson: PackageJson): Plugin;
//# sourceMappingURL=generate-package-json.d.ts.map