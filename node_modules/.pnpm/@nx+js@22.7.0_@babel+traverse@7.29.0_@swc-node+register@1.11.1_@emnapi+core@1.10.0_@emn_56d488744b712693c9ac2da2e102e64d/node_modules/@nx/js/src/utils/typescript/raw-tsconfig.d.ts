/**
 * Lightweight tsconfig extends walker that does NOT load the `typescript`
 * package. For full TypeScript-aware parsing (compilerOptions resolution,
 * file lists, project references, etc.) see the `@nx/js/typescript` plugin,
 * which uses `ts.parseJsonConfigFileContent` and a persistent cache.
 */
/**
 * Cache of raw parsed tsconfig JSON contents, keyed by absolute file path.
 * `null` indicates a file that doesn't exist or failed to parse.
 *
 * Instantiate with `new Map()` and reuse across `walkTsconfigExtendsChain`
 * calls within one `createNodes` invocation to dedupe file reads when many
 * starting points share parent tsconfigs.
 */
export type RawTsconfigJsonCache = Map<string, unknown | null>;
/**
 * Walks the `extends` chain of a tsconfig, invoking `visit` for each unique
 * reachable file (entry first, then recursively). Cycle-safe. Files that
 * don't exist or fail to parse are silently skipped.
 *
 * When a tsconfig has multiple `extends` entries they are visited in
 * REVERSE order, so visitors looking for the effective value of an
 * inherited option see the highest-precedence entries first and can
 * return `'stop'` to abort the traversal. Visitors that want to collect
 * every reachable file should always return `'continue'`.
 *
 * @param entryAbsolutePath Absolute, canonical path of the tsconfig to
 *   start from. Pass through `path.resolve()` if unsure.
 * @param visit Invoked once per unique reachable tsconfig.
 * @param options.jsonCache Optional shared cache of parsed tsconfig
 *   contents. When omitted, the walker uses a fresh internal cache.
 */
export declare function walkTsconfigExtendsChain(entryAbsolutePath: string, visit: (absolutePath: string, rawJson: unknown) => 'continue' | 'stop', options?: {
    jsonCache?: RawTsconfigJsonCache;
}): void;
//# sourceMappingURL=raw-tsconfig.d.ts.map