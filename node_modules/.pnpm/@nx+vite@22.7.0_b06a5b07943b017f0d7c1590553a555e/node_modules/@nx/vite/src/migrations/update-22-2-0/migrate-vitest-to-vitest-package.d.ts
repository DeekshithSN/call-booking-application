import { type GeneratorCallback, type Tree } from '@nx/devkit';
/**
 * Migrates Vitest usage from @nx/vite to @nx/vitest package.
 *
 * This migration:
 * 1. Installs @nx/vitest package if not present
 * 2. Converts @nx/vite:test executor usages to @nx/vitest:test
 * 3. Splits @nx/vite/plugin configurations to add @nx/vitest plugin
 * 4. Migrates targetDefaults from @nx/vite:test to @nx/vitest:test
 */
export default function migrateVitestToVitestPackage(tree: Tree): Promise<GeneratorCallback>;
//# sourceMappingURL=migrate-vitest-to-vitest-package.d.ts.map