interface NxReactBabelOptions {
    decorators?: {
        decoratorsBeforeExport?: boolean;
        legacy?: boolean;
    };
    development?: boolean;
    importSource?: string;
    loose?: boolean;
    reactCompiler?: boolean | {
        compilationMode?: string;
        sources?: (filename: string) => boolean;
    };
    runtime?: string;
    useBuiltIns?: boolean | string;
    /** @deprecated Use `loose` option instead of `classProperties.loose`
     */
    classProperties?: {
        loose?: boolean;
    };
}
declare function getReactPresetOptions({ presetOptions, env, }: {
    env: string;
    presetOptions: NxReactBabelOptions;
}): Record<string, string | boolean>;
//# sourceMappingURL=babel.d.ts.map