import type { Plugin } from 'rollup';
import { AssetGlob } from '@nx/js/src/utils/assets/assets';
export interface NxCopyAssetsPluginOptions {
    assets: (string | AssetGlob)[];
    outputPath: string;
    projectRoot: string;
}
/**
 * Splits a glob into its literal directory prefix and the remaining pattern.
 * CopyAssetsHandler expects input to be a directory and glob to be a pattern
 * within it (e.g., input: 'docs', glob: '**\/*.md'), not combined paths.
 *
 * 'libs/mylib/README.md' => { prefix: 'libs/mylib', glob: 'README.md' }
 * 'docs/*.md' => { prefix: 'docs', glob: '*.md' }
 * '**\/*.md' => { prefix: '.', glob: '**\/*.md' }
 *
 * @visibleForTesting
 */
export declare function extractGlobLiteralPrefix(glob: string): {
    prefix: string;
    glob: string;
};
export declare function nxCopyAssetsPlugin(options: NxCopyAssetsPluginOptions): Plugin;
//# sourceMappingURL=nx-copy-assets.plugin.d.ts.map