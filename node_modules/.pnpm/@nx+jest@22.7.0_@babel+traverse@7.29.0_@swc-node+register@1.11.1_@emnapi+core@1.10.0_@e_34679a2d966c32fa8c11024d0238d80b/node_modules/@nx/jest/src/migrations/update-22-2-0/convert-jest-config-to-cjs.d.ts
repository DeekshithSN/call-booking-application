import { Tree } from '@nx/devkit';
/**
 * Migration to convert jest.config.ts files from ESM to CJS syntax for projects
 * using CommonJS resolution. This is needed because Node.js type-stripping
 * in newer versions (22+, 24+) can cause issues with ESM syntax in .ts files
 * when the project is configured for CommonJS.
 *
 * This migration only runs if @nx/jest/plugin is registered in nx.json.
 *
 * Conversions:
 * - `export default { ... }` -> `module.exports = { ... }`
 * - `import { x } from 'y'` -> `const { x } = require('y')`
 * - `import x from 'y'` -> `const x = require('y').default ?? require('y')`
 *
 * ESM-only features that cannot be converted (will warn user):
 * - `import.meta`
 * - top-level `await`
 *
 * Projects with `type: module` in package.json will be warned as they are
 * incompatible with @nx/jest/plugin which forces CommonJS resolution.
 */
export default function convertJestConfigToCjs(tree: Tree): Promise<() => void>;
//# sourceMappingURL=convert-jest-config-to-cjs.d.ts.map