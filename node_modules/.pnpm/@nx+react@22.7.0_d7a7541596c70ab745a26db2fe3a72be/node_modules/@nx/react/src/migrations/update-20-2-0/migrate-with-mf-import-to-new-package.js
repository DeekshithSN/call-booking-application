"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = migrateWithMfImport;
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const versions_1 = require("../../utils/versions");
const NX_RSPACK_MODULE_FEDERATION_IMPORT_SELECTOR = 'ImportDeclaration > StringLiteral[value=@nx/react/module-federation], VariableStatement CallExpression:has(Identifier[name=require]) > StringLiteral[value=@nx/react/module-federation]';
const NEW_IMPORT_PATH = `'@nx/module-federation/webpack'`;
async function migrateWithMfImport(tree) {
    const projects = new Set();
    (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nx/react:module-federation-dev-server', (options, project, target) => {
        const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, project);
        projects.add(projectConfig.root);
    });
    for (const projectRoot of projects) {
        (0, devkit_1.visitNotIgnoredFiles)(tree, projectRoot, (filePath) => {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
                return;
            }
            let contents = tree.read(filePath, 'utf-8');
            if (!contents.includes('@nx/react/module-federation')) {
                return;
            }
            const sourceFile = (0, tsquery_1.ast)(contents);
            const importNodes = (0, tsquery_1.query)(sourceFile, NX_RSPACK_MODULE_FEDERATION_IMPORT_SELECTOR);
            if (importNodes.length === 0) {
                return;
            }
            const importPathNode = importNodes[0];
            contents = `${contents.slice(0, importPathNode.getStart())}${NEW_IMPORT_PATH}${contents.slice(importPathNode.getEnd())}`;
            tree.write(filePath, contents);
        });
    }
    if (projects.size !== 0) {
        (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
            '@nx/module-federation': versions_1.nxVersion,
        });
    }
    await (0, devkit_1.formatFiles)(tree);
}
