"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractGlobLiteralPrefix = extractGlobLiteralPrefix;
exports.nxCopyAssetsPlugin = nxCopyAssetsPlugin;
const node_path_1 = require("node:path");
const devkit_1 = require("@nx/devkit");
const copy_assets_handler_1 = require("@nx/js/src/utils/assets/copy-assets-handler");
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
function extractGlobLiteralPrefix(glob) {
    const parts = glob.split('/');
    const isGlobPart = (p) => p.includes('*') || p.includes('?') || p.includes('[') || p.includes('{');
    const firstGlobIndex = parts.findIndex(isGlobPart);
    const hasGlob = firstGlobIndex !== -1;
    const prefixParts = hasGlob
        ? parts.slice(0, firstGlobIndex)
        : parts.slice(0, -1);
    const globParts = hasGlob ? parts.slice(firstGlobIndex) : parts.slice(-1);
    return {
        prefix: prefixParts.join('/') || '.',
        glob: globParts.join('/'),
    };
}
function nxCopyAssetsPlugin(options) {
    let handler;
    let dispose;
    if (global.NX_GRAPH_CREATION)
        return { name: 'nx-copy-assets-plugin' };
    const relativeProjectRoot = (0, node_path_1.relative)(devkit_1.workspaceRoot, options.projectRoot);
    return {
        name: 'nx-copy-assets-plugin',
        async buildStart() {
            // Input must be relative to rootDir because CopyAssetsHandler computes
            // destination paths using path.relative(input, globResult), and glob
            // returns paths relative to rootDir.
            const assets = options.assets.map((a) => {
                if (typeof a === 'string') {
                    return (0, node_path_1.join)(relativeProjectRoot, a);
                }
                else {
                    // relative() returns '' when paths are equal, normalize to '.'
                    const relativeInput = (0, node_path_1.relative)(devkit_1.workspaceRoot, a.input) || '.';
                    const { prefix: globPrefix, glob: normalizedGlob } = extractGlobLiteralPrefix(a.glob);
                    return {
                        ...a,
                        input: (0, node_path_1.join)(relativeInput, globPrefix),
                        glob: normalizedGlob,
                    };
                }
            });
            const outputDir = (0, node_path_1.isAbsolute)(options.outputPath)
                ? options.outputPath
                : (0, node_path_1.join)(devkit_1.workspaceRoot, options.outputPath);
            handler = new copy_assets_handler_1.CopyAssetsHandler({
                rootDir: devkit_1.workspaceRoot,
                projectDir: options.projectRoot,
                outputDir,
                assets,
            });
            if (this.meta.watchMode && (0, devkit_1.isDaemonEnabled)()) {
                dispose = await handler.watchAndProcessOnAssetChange();
            }
        },
        async writeBundle() {
            await handler.processAllAssetsOnce();
        },
        closeWatcher() {
            dispose?.();
        },
    };
}
