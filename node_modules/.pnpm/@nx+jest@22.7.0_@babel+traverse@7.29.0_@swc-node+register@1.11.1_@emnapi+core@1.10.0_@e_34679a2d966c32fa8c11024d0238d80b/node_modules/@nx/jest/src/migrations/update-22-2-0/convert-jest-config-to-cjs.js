"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = convertJestConfigToCjs;
const devkit_1 = require("@nx/devkit");
const find_plugin_for_config_file_1 = require("@nx/devkit/src/utils/find-plugin-for-config-file");
const path_1 = require("path");
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
async function convertJestConfigToCjs(tree) {
    // If @nx/jest/plugin not used, then there will not be any problems with graph construction, which
    // is what we're trying to address.
    if (!isJestPluginRegistered(tree))
        return;
    const { ast: parseAst, query } = require('@phenomnomnominal/tsquery');
    const jestConfigPaths = await (0, devkit_1.globAsync)(tree, ['**/jest.config.ts']);
    const projectsWithEsmOnlyFeatures = [];
    const projectsWithTypeModule = [];
    const modifiedFiles = [];
    for (const configPath of jestConfigPaths) {
        // Skip config files that are excluded from the plugin via include/exclude patterns
        const pluginRegistration = await (0, find_plugin_for_config_file_1.findPluginForConfigFile)(tree, '@nx/jest/plugin', configPath);
        if (!pluginRegistration)
            continue;
        const projectRoot = (0, path_1.dirname)(configPath);
        const packageJsonPath = (0, devkit_1.joinPathFragments)(projectRoot, 'package.json');
        const rootPackageJsonPath = 'package.json';
        // Check project-level package.json first, then root
        let projectPackageJson = null;
        let rootPackageJson = null;
        if (tree.exists(packageJsonPath)) {
            projectPackageJson = (0, devkit_1.readJson)(tree, packageJsonPath);
        }
        if (tree.exists(rootPackageJsonPath)) {
            rootPackageJson = (0, devkit_1.readJson)(tree, rootPackageJsonPath);
        }
        const effectiveType = projectPackageJson?.type ?? rootPackageJson?.type ?? 'commonjs'; // CJS is default if missing
        // If type is "module", warn user - this is incompatible with @nx/jest/plugin
        // Should not be possible, but it's possible that there's a way to get this working that we're unaware of
        if (effectiveType === 'module') {
            projectsWithTypeModule.push(configPath);
            continue;
        }
        let content = tree.read(configPath, 'utf-8');
        // Check for ESM-only features that can't be converted
        const hasImportMeta = query(content, 'MetaProperty').length > 0 ||
            content.includes('import.meta');
        const hasTopLevelAwait = checkForTopLevelAwait(content, parseAst, query);
        if (hasImportMeta || hasTopLevelAwait) {
            projectsWithEsmOnlyFeatures.push(configPath);
            continue;
        }
        content = convertImportsToRequire(content, parseAst, query);
        content = convertExportDefaultToModuleExports(content, query);
        tree.write(configPath, content);
        modifiedFiles.push(configPath);
    }
    if (modifiedFiles.length > 0) {
        await (0, devkit_1.formatFiles)(tree);
    }
    const hasWarnings = projectsWithEsmOnlyFeatures.length > 0 || projectsWithTypeModule.length > 0;
    if (hasWarnings) {
        return () => {
            if (projectsWithTypeModule.length > 0) {
                devkit_1.logger.warn(`The following projects have "type": "module" in their package.json which is incompatible ` +
                    `with @nx/jest/plugin. Consider removing "type": "module" ` +
                    `or using a different Jest configuration approach:\n` +
                    projectsWithTypeModule.map((p) => `  - ${p}`).join('\n'));
            }
            if (projectsWithEsmOnlyFeatures.length > 0) {
                devkit_1.logger.warn(`The following jest.config.ts files use ESM-only features (import.meta or top-level await) ` +
                    `and could not be automatically converted to CommonJS. Please update them manually:\n` +
                    projectsWithEsmOnlyFeatures.map((p) => `  - ${p}`).join('\n'));
            }
        };
    }
}
function checkForTopLevelAwait(content, parseAst, query) {
    const ts = require('typescript');
    // Check for await expressions that are not inside a function
    const sourceFile = parseAst(content);
    const awaitExpressions = query(sourceFile, 'AwaitExpression');
    for (const awaitExpr of awaitExpressions) {
        let parent = awaitExpr.parent;
        let isInsideFunction = false;
        while (parent) {
            if (ts.isFunctionLike(parent)) {
                isInsideFunction = true;
                break;
            }
            parent = parent.parent;
        }
        if (!isInsideFunction) {
            return true;
        }
    }
    return false;
}
function convertImportsToRequire(content, parseAst, query) {
    const ts = require('typescript');
    const sourceFile = parseAst(content);
    const importDeclarations = query(sourceFile, 'ImportDeclaration');
    if (importDeclarations.length === 0) {
        return content;
    }
    // Sort imports by position (descending) to replace from end to start
    // This preserves positions of earlier nodes
    const sortedImports = [...importDeclarations].sort((a, b) => b.getStart() - a.getStart());
    for (const importDecl of sortedImports) {
        const moduleSpecifier = importDecl.moduleSpecifier
            .getText()
            .replace(/['"]/g, '');
        const importClause = importDecl.importClause;
        if (!importClause) {
            // Side-effect import: import 'module'
            const requireStatement = `require('${moduleSpecifier}')`;
            content = replaceNode(content, importDecl, requireStatement);
            continue;
        }
        const parts = [];
        // Default import: import x from 'module'
        if (importClause.name) {
            const defaultName = importClause.name.getText();
            parts.push(`const ${defaultName} = require('${moduleSpecifier}').default ?? require('${moduleSpecifier}')`);
        }
        // Named imports: import { a, b } from 'module'
        if (importClause.namedBindings) {
            if (ts.isNamedImports(importClause.namedBindings)) {
                const namedImports = importClause.namedBindings.elements
                    .map((element) => {
                    const name = element.name.getText();
                    const propertyName = element.propertyName?.getText();
                    if (propertyName) {
                        return `${propertyName}: ${name}`;
                    }
                    return name;
                })
                    .join(', ');
                parts.push(`const { ${namedImports} } = require('${moduleSpecifier}')`);
            }
            else if (ts.isNamespaceImport(importClause.namedBindings)) {
                // Namespace import: import * as x from 'module'
                const namespaceName = importClause.namedBindings.name.getText();
                parts.push(`const ${namespaceName} = require('${moduleSpecifier}')`);
            }
        }
        const requireStatement = parts.join(';\n');
        content = replaceNode(content, importDecl, requireStatement);
    }
    return content;
}
function convertExportDefaultToModuleExports(content, query) {
    // Handle: export default { ... }
    const exportAssignments = query(content, 'ExportAssignment');
    if (exportAssignments.length > 0) {
        for (const exportAssignment of exportAssignments) {
            const expression = exportAssignment.expression;
            if (expression) {
                const exportedValue = expression.getText();
                const replacement = `module.exports = ${exportedValue}`;
                content = replaceNode(content, exportAssignment, replacement);
            }
        }
    }
    return content;
}
function replaceNode(content, node, replacement) {
    const start = node.getStart();
    const end = node.getEnd();
    // Remove trailing semicolon if present to avoid double semicolons
    let endPos = end;
    if (content[end] === ';') {
        endPos = end + 1;
    }
    return content.slice(0, start) + replacement + ';' + content.slice(endPos);
}
function isJestPluginRegistered(tree) {
    if (!tree.exists('nx.json')) {
        return false;
    }
    const nxJson = (0, devkit_1.readJson)(tree, 'nx.json');
    const plugins = nxJson.plugins ?? [];
    return plugins.some((plugin) => {
        const pluginName = typeof plugin === 'string' ? plugin : plugin.plugin;
        return pluginName === '@nx/jest/plugin' || pluginName === '@nx/jest';
    });
}
