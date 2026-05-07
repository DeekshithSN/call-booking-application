import { AssetGlob } from './assets';
import { normalizeAssets, getAssetOutputPath, NormalizedAssetEntry as AssetEntry } from './normalize-assets';
import { ChangedFile } from 'nx/src/daemon/client/client';
export type { AssetEntry };
export { normalizeAssets, getAssetOutputPath };
export type FileEventType = 'create' | 'update' | 'delete';
export interface FileEvent {
    type: FileEventType;
    src: string;
    dest: string;
}
interface CopyAssetHandlerOptions {
    projectDir: string;
    rootDir: string;
    outputDir: string;
    assets: (string | AssetGlob)[];
    callback?: (events: FileEvent[]) => void;
    includeIgnoredFiles?: boolean;
}
export declare const defaultFileEventHandler: (events: FileEvent[]) => void;
export declare class CopyAssetsHandler {
    private readonly projectDir;
    private readonly rootDir;
    private readonly outputDir;
    private readonly assetGlobs;
    private readonly ignore;
    private readonly callback;
    private readonly includeIgnoredFiles;
    constructor(opts: CopyAssetHandlerOptions);
    processAllAssetsOnce(): Promise<void>;
    processAllAssetsOnceSync(): void;
    private getIgnorePatternsForAsset;
    watchAndProcessOnAssetChange(): Promise<() => void>;
    processWatchEvents(events: ChangedFile[]): Promise<void>;
    private filesToEvent;
    private normalizeAssetPattern;
}
//# sourceMappingURL=copy-assets-handler.d.ts.map