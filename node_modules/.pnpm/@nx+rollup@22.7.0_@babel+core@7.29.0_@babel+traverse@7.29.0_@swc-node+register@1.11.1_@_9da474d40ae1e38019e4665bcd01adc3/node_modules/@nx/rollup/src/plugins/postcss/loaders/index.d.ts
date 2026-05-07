import type { LoaderContext, LoaderResult, PostCSSLoaderOptions } from './types';
import type { UseOptions } from '../options';
export * from './types';
export { createPostCSSLoader } from './postcss-loader';
export { createLessLoader } from './less-loader';
export { createSassLoader } from './sass-loader';
export { createStylusLoader } from './stylus-loader';
interface LoadersOptions {
    /** PostCSS loader options */
    postcss: PostCSSLoaderOptions;
    /** Preprocessor options */
    use: UseOptions;
}
/**
 * Manages the chain of CSS loaders (preprocessors + PostCSS)
 */
export declare class Loaders {
    private loaders;
    constructor(options: LoadersOptions);
    /**
     * Register preprocessor loaders based on the 'use' option
     */
    private registerPreprocessors;
    /**
     * Check if any loader can process the given file
     */
    isSupported(filepath: string): boolean;
    /**
     * Check if a file matches a loader's test
     */
    private matchesLoader;
    /**
     * Process a file through the loader chain
     * Preprocessors run first (if matching), then PostCSS always runs
     */
    process(code: string, context: LoaderContext): Promise<LoaderResult>;
}
//# sourceMappingURL=index.d.ts.map