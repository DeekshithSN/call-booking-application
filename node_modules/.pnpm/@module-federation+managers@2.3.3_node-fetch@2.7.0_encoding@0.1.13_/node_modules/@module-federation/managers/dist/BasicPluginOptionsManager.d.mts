export declare class BasicPluginOptionsManager<T> {
    private _options?;
    private _root;
    constructor(root?: string);
    get enable(): boolean;
    get options(): T;
    get root(): string;
    init(options: T, extraArgs?: Record<string, any>): void;
    setOptions(options: T): void;
}
