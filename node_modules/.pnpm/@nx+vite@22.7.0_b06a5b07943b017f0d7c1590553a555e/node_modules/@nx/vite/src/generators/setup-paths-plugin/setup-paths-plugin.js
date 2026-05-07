"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupPathsPlugin = setupPathsPlugin;
const devkit_1 = require("@nx/devkit");
async function setupPathsPlugin(tree, schema) {
    const files = await (0, devkit_1.globAsync)(tree, [
        '**/vite.config.{js,ts,mjs,mts,cjs,cts}',
    ]);
    for (const file of files) {
        ensureImportExists(tree, file);
        ensurePluginAdded(tree, file);
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
}
function ensureImportExists(tree, file) {
    const { tsquery } = require('@phenomnomnominal/tsquery');
    let content = tree.read(file, 'utf-8');
    const ast = tsquery.ast(content);
    const allImports = tsquery.query(ast, 'ImportDeclaration');
    if (content.includes('@nx/vite/plugins/nx-tsconfig-paths.plugin')) {
        return;
    }
    if (allImports.length) {
        const lastImport = allImports[allImports.length - 1];
        tree.write(file, (0, devkit_1.applyChangesToString)(content, [
            {
                type: devkit_1.ChangeType.Insert,
                index: lastImport.end + 1,
                text: `import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';\n`,
            },
        ]));
    }
    else {
        if (file.endsWith('.cts') || file.endsWith('.cjs')) {
            tree.write(file, (0, devkit_1.applyChangesToString)(content, [
                {
                    type: devkit_1.ChangeType.Insert,
                    index: 0,
                    text: `const { nxViteTsPaths } = require('@nx/vite/plugins/nx-tsconfig-paths.plugin');\n`,
                },
            ]));
        }
        else {
            tree.write(file, (0, devkit_1.applyChangesToString)(content, [
                {
                    type: devkit_1.ChangeType.Insert,
                    index: 0,
                    text: `import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';\n`,
                },
            ]));
        }
    }
}
function ensurePluginAdded(tree, file) {
    const { tsquery } = require('@phenomnomnominal/tsquery');
    const content = tree.read(file, 'utf-8');
    const ast = tsquery.ast(content);
    const foundDefineConfig = tsquery.query(ast, 'CallExpression:has(Identifier[name="defineConfig"])');
    if (!foundDefineConfig.length)
        return content;
    // Do not update defineConfig if it has an arrow function since it can be tricky and error-prone.
    const defineUsingArrowFunction = tsquery.query(foundDefineConfig[0], 'ArrowFunction');
    if (defineUsingArrowFunction.length)
        return content;
    const propertyAssignments = tsquery.query(foundDefineConfig[0], 'PropertyAssignment');
    if (propertyAssignments.length) {
        const pluginsNode = tsquery.query(foundDefineConfig[0], 'PropertyAssignment:has(Identifier[name="plugins"])');
        if (pluginsNode.length) {
            const updated = tsquery.replace(content, 'PropertyAssignment:has(Identifier[name="plugins"])', (node) => {
                const found = tsquery.query(node, 'ArrayLiteralExpression');
                let updatedPluginsString = '';
                const existingPluginNodes = found?.[0].elements ?? [];
                for (const plugin of existingPluginNodes) {
                    updatedPluginsString += `${plugin.getText()},`;
                }
                if (!existingPluginNodes?.some((node) => node.getText().includes('nxViteTsPaths'))) {
                    updatedPluginsString += ` nxViteTsPaths(),`;
                }
                return `plugins: [${updatedPluginsString}]`;
            });
            tree.write(file, updated);
        }
        else {
            tree.write(file, (0, devkit_1.applyChangesToString)(content, [
                {
                    type: devkit_1.ChangeType.Insert,
                    index: propertyAssignments[0].getStart(),
                    text: `plugins: [nxViteTsPaths()],
            `,
                },
            ]));
        }
    }
    else {
        tree.write(file, (0, devkit_1.applyChangesToString)(content, [
            {
                type: devkit_1.ChangeType.Insert,
                index: foundDefineConfig[0].getStart() + 14, // length of "defineConfig(" + 1
                text: `plugins: [nxViteTsPaths()],`,
            },
        ]));
    }
}
exports.default = setupPathsPlugin;
