export declare class PKGJsonManager {
    private _pkg?;
    setPKGJson(pkg: Record<string, any>): void;
    readPKGJson(root?: string): Record<string, any>;
    getExposeGarfishModuleType(root?: string): string;
}
