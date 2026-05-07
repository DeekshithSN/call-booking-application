"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toProjectRelativePath = toProjectRelativePath;
exports.getViteConfigPath = getViteConfigPath;
exports.addConfigValuesToViteConfig = addConfigValuesToViteConfig;
const posix_1 = require("path/posix");
const devkit_1 = require("@nx/devkit");
const tsquery_1 = require("@phenomnomnominal/tsquery");
function toProjectRelativePath(path, projectRoot) {
    if (projectRoot === '.') {
        // workspace and project root are the same, we normalize it to ensure it
        // works with Jest since some paths only work when they start with `./`
        return path.startsWith('.') ? path : `./${path}`;
    }
    const relativePath = (0, posix_1.relative)((0, posix_1.resolve)(devkit_1.workspaceRoot, projectRoot), (0, posix_1.resolve)(devkit_1.workspaceRoot, path));
    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}
function getViteConfigPath(tree, root) {
    return [
        (0, devkit_1.joinPathFragments)(root, `vite.config.ts`),
        (0, devkit_1.joinPathFragments)(root, `vite.config.cts`),
        (0, devkit_1.joinPathFragments)(root, `vite.config.mts`),
        (0, devkit_1.joinPathFragments)(root, `vite.config.js`),
        (0, devkit_1.joinPathFragments)(root, `vite.config.cjs`),
        (0, devkit_1.joinPathFragments)(root, `vite.config.mjs`),
    ].find((f) => tree.exists(f));
}
function addConfigValuesToViteConfig(tree, configFile, configValues) {
    const IMPORT_PROPERTY_SELECTOR = 'ImportDeclaration';
    const viteConfigContents = tree.read(configFile, 'utf-8');
    const sourceFile = (0, tsquery_1.ast)(viteConfigContents);
    // AST TO GET SECTION TO APPEND TO
    const importNodes = (0, tsquery_1.query)(sourceFile, IMPORT_PROPERTY_SELECTOR);
    if (importNodes.length === 0) {
        return;
    }
    const lastImportNode = importNodes[importNodes.length - 1];
    const configValuesString = `
  // These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
  const configValues = ${JSON.stringify(configValues)};
  
  // Determine the correct configValue to use based on the configuration
  const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default';
  
  const options = {
    ...configValues.default,
    ...(configValues[nxConfiguration] ?? {})
  }`;
    tree.write(configFile, `${viteConfigContents.slice(0, lastImportNode.getEnd())}
  ${configValuesString}
  ${viteConfigContents.slice(lastImportNode.getEnd())}`);
}
