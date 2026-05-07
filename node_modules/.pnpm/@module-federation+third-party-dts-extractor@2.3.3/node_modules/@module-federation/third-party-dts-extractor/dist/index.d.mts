type ThirdPartyExtractorOptions = {
    destDir: string;
    context?: string;
    exclude?: Array<string | RegExp>;
};
declare class ThirdPartyExtractor {
    pkgs: Record<string, string>;
    pattern: RegExp;
    context: string;
    destDir: string;
    exclude: Array<string | RegExp>;
    constructor({ destDir, context, exclude, }: ThirdPartyExtractorOptions);
    addPkgs(pkgName: string, dirName: string): void;
    inferPkgDir(importPath: string): string | void;
    collectTypeImports(str: string): string[];
    collectPkgs(str: string): void;
    copyDts(): Promise<void>;
}

export { ThirdPartyExtractor };
