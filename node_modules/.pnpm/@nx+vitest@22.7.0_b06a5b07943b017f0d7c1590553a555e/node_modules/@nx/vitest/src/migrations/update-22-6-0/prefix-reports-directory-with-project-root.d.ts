import { type Tree } from '@nx/devkit';
/**
 * Migrates reportsDirectory option for @nx/vitest:test and @nx/vite:test executors.
 *
 * Previously, reportsDirectory was resolved relative to the project root (cwd).
 * Now it is resolved relative to the workspace root. This migration prepends
 * {projectRoot}/ to existing naked paths so the resolved location stays the same.
 */
export default function prefixReportsDirectoryWithProjectRoot(tree: Tree): void;
//# sourceMappingURL=prefix-reports-directory-with-project-root.d.ts.map