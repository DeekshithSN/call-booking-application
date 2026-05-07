export interface AssetGlobInput {
    input: string;
    output: string;
    glob: string;
    ignore?: string[];
    includeIgnoredFiles?: boolean;
}
export interface NormalizedAssetEntry {
    isGlob: boolean;
    pattern: string;
    ignore: string[] | null;
    input: string;
    output: string;
    includeIgnoredFiles?: boolean;
}
/**
 * Normalize raw asset definitions (strings or objects) into resolved
 * entries with computed input, output, and pattern fields.
 */
export declare function normalizeAssets(assets: (string | AssetGlobInput)[], rootDir: string, projectDir: string, outputDir: string): NormalizedAssetEntry[];
/**
 * Compute the output path for a file given its asset entry,
 * matching the dest logic used during file copying.
 */
export declare function getAssetOutputPath(src: string, assetEntry: NormalizedAssetEntry): string;
//# sourceMappingURL=normalize-assets.d.ts.map