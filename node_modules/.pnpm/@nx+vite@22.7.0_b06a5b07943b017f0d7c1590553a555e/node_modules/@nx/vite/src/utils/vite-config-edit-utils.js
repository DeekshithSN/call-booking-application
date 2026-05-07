"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureViteConfigIsCorrect = ensureViteConfigIsCorrect;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
function ensureViteConfigIsCorrect(tree, path, buildConfigString, buildConfigObject, imports, plugins, testConfigString, testConfigObject, cacheDir, projectAlreadyHasViteTargets) {
    const fileContent = tree.read(path, 'utf-8');
    let updatedContent = undefined;
    if (!projectAlreadyHasViteTargets?.test && testConfigString?.length) {
        updatedContent = handleBuildOrTestNode(fileContent, testConfigString, testConfigObject, 'test');
    }
    if (!projectAlreadyHasViteTargets?.build && buildConfigString?.length) {
        updatedContent = handleBuildOrTestNode(updatedContent ?? fileContent, buildConfigString, buildConfigObject, 'build');
    }
    updatedContent =
        handlePluginNode(updatedContent ?? fileContent, imports, plugins) ??
            updatedContent;
    if (cacheDir?.length) {
        updatedContent = handleCacheDirNode(updatedContent ?? fileContent, cacheDir);
    }
    if (updatedContent) {
        tree.write(path, updatedContent);
        return true;
    }
    else {
        return false;
    }
}
function handleBuildOrTestNode(updatedFileContent, configContentString, configContentObject, name) {
    const { tsquery } = require('@phenomnomnominal/tsquery');
    const buildOrTestNode = tsquery.query(updatedFileContent, `PropertyAssignment:has(Identifier[name="${name}"])`);
    if (buildOrTestNode.length) {
        return tsquery.replace(updatedFileContent, `PropertyAssignment:has(Identifier[name="${name}"])`, (node) => {
            const existingProperties = tsquery.query(node.initializer, 'PropertyAssignment');
            let updatedPropsString = '';
            for (const prop of existingProperties) {
                const propName = prop.name.getText();
                if (!configContentObject[propName] &&
                    propName !== 'dir' &&
                    propName !== 'reportsDirectory' &&
                    propName !== 'provider') {
                    // NOTE: Watch for formatting.
                    updatedPropsString += `    '${propName}': ${prop.initializer.getText()},\n`;
                }
            }
            for (const [propName, propValue] of Object.entries(configContentObject)) {
                // NOTE: Watch for formatting.
                if (propName === 'coverage') {
                    let propString = `    '${propName}': {\n`;
                    for (const [pName, pValue] of Object.entries(propValue)) {
                        if (pName === 'provider') {
                            propString += `    '${pName}': ${pValue} as const,\n`;
                        }
                        else {
                            propString += `    '${pName}': '${pValue}',\n`;
                        }
                    }
                    propString += `}`;
                    updatedPropsString += `${propString}\n`;
                }
                else if (propName === 'lib') {
                    let propString = `    '${propName}': {\n`;
                    for (const [pName, pValue] of Object.entries(propValue)) {
                        if (pName === 'formats') {
                            propString += `      '${pName}': [${pValue
                                .map((format) => `'${format}' as const`)
                                .join(', ')}],\n`;
                        }
                        else {
                            propString += `      '${pName}': ${JSON.stringify(pValue)},\n`;
                        }
                    }
                    propString += `    },`;
                    updatedPropsString += `${propString}\n`;
                }
                else {
                    updatedPropsString += `    '${propName}': ${JSON.stringify(propValue)},\n`;
                }
            }
            return `${name}: {
${updatedPropsString}  }`;
        });
    }
    else {
        const foundDefineConfig = tsquery.query(updatedFileContent, 'CallExpression:has(Identifier[name="defineConfig"])');
        if (foundDefineConfig.length) {
            const conditionalConfig = tsquery.query(foundDefineConfig[0], 'ArrowFunction');
            if (conditionalConfig.length) {
                if (name === 'build') {
                    return transformConditionalConfig(conditionalConfig, updatedFileContent, configContentString);
                }
                else {
                    // no test config in conditional config
                    return updatedFileContent;
                }
            }
            else {
                const propertyAssignments = tsquery.query(foundDefineConfig[0], 'PropertyAssignment');
                if (propertyAssignments.length) {
                    return (0, devkit_1.applyChangesToString)(updatedFileContent, [
                        {
                            type: devkit_1.ChangeType.Insert,
                            index: propertyAssignments[0].getStart(),
                            text: configContentString,
                        },
                    ]);
                }
                else {
                    return (0, devkit_1.applyChangesToString)(updatedFileContent, [
                        {
                            type: devkit_1.ChangeType.Insert,
                            index: foundDefineConfig[0].getStart() + 14,
                            text: configContentString,
                        },
                    ]);
                }
            }
        }
        else {
            // build config does not exist and defineConfig is not used
            // could also potentially be invalid syntax, so try-catch
            try {
                const defaultExport = tsquery.query(updatedFileContent, 'ExportAssignment');
                const found = tsquery.query(defaultExport?.[0], 'ObjectLiteralExpression');
                const startOfObject = found?.[0].getStart();
                return (0, devkit_1.applyChangesToString)(updatedFileContent, [
                    {
                        type: devkit_1.ChangeType.Insert,
                        index: startOfObject + 1,
                        text: configContentString,
                    },
                ]);
            }
            catch {
                return updatedFileContent;
            }
        }
    }
}
function transformCurrentBuildObject(index, returnStatements, appFileContent, buildConfigObject) {
    if (!returnStatements?.[index]) {
        return undefined;
    }
    const { tsquery } = require('@phenomnomnominal/tsquery');
    const currentBuildObject = tsquery
        .query(returnStatements[index], 'ObjectLiteralExpression')?.[0]
        .getText();
    const currentBuildObjectStart = returnStatements[index].getStart();
    const currentBuildObjectEnd = returnStatements[index].getEnd();
    const newReturnObject = tsquery.replace(returnStatements[index].getText(), 'ObjectLiteralExpression', (_node) => {
        return `{
        ...${currentBuildObject},
        ...${JSON.stringify(buildConfigObject)}
      }`;
    });
    const newContents = (0, devkit_1.applyChangesToString)(appFileContent, [
        {
            type: devkit_1.ChangeType.Delete,
            start: currentBuildObjectStart,
            length: currentBuildObjectEnd - currentBuildObjectStart,
        },
        {
            type: devkit_1.ChangeType.Insert,
            index: currentBuildObjectStart,
            text: newReturnObject,
        },
    ]);
    return newContents;
}
function transformConditionalConfig(conditionalConfig, appFileContent, buildConfigObject) {
    const { tsquery } = require('@phenomnomnominal/tsquery');
    const { SyntaxKind } = require('typescript');
    const functionBlock = tsquery.query(conditionalConfig[0], 'Block');
    const ifStatement = tsquery.query(functionBlock?.[0], 'IfStatement');
    const binaryExpressions = tsquery.query(ifStatement?.[0], 'BinaryExpression');
    const buildExists = binaryExpressions?.find((binaryExpression) => binaryExpression.getText() === `command === 'build'`);
    const buildExistsExpressionIndex = binaryExpressions?.findIndex((binaryExpression) => binaryExpression.getText() === `command === 'build'`);
    const serveExists = binaryExpressions?.find((binaryExpression) => binaryExpression.getText() === `command === 'serve'`);
    const elseKeywordExists = (0, js_1.findNodes)(ifStatement?.[0], SyntaxKind.ElseKeyword);
    const returnStatements = tsquery.query(ifStatement[0], 'ReturnStatement');
    if (!buildExists) {
        if (serveExists && elseKeywordExists) {
            // build options live inside the else block
            return (transformCurrentBuildObject(returnStatements?.length - 1, returnStatements, appFileContent, buildConfigObject) ?? appFileContent);
        }
        else {
            // no build options exist yet
            const functionBlockStart = functionBlock?.[0].getStart();
            const newContents = (0, devkit_1.applyChangesToString)(appFileContent, [
                {
                    type: devkit_1.ChangeType.Insert,
                    index: functionBlockStart + 1,
                    text: `
            if (command === 'build') {
              return ${JSON.stringify(buildConfigObject)}
            }
            `,
                },
            ]);
            return newContents;
        }
    }
    else {
        // build already exists
        // it will be the return statement which lives
        // at the buildExistsExpressionIndex
        return (transformCurrentBuildObject(buildExistsExpressionIndex, returnStatements, appFileContent, buildConfigObject) ?? appFileContent);
    }
}
function handlePluginNode(appFileContent, imports, plugins) {
    const { tsquery } = require('@phenomnomnominal/tsquery');
    const file = tsquery.ast(appFileContent);
    const pluginsNode = tsquery.query(file, 'PropertyAssignment:has(Identifier[name="plugins"])');
    let writeFile = false;
    if (pluginsNode.length) {
        appFileContent = tsquery.replace(file.getText(), 'PropertyAssignment:has(Identifier[name="plugins"])', (node) => {
            const found = tsquery.query(node, 'ArrayLiteralExpression');
            let updatedPluginsString = '';
            const existingPluginNodes = found?.[0].elements ?? [];
            for (const plugin of existingPluginNodes) {
                updatedPluginsString += `${plugin.getText()}, `;
            }
            for (const plugin of plugins) {
                if (!existingPluginNodes?.some((node) => node.getText().includes(plugin))) {
                    updatedPluginsString += `${plugin}, `;
                }
            }
            return `plugins: [${updatedPluginsString}]`;
        });
        writeFile = true;
    }
    else {
        // Plugins node does not exist yet
        // So make one from scratch
        const foundDefineConfig = tsquery.query(file, 'CallExpression:has(Identifier[name="defineConfig"])');
        if (foundDefineConfig.length) {
            const conditionalConfig = tsquery.query(foundDefineConfig[0], 'ArrowFunction');
            if (conditionalConfig.length) {
                // We are NOT transforming the conditional config
                // with plugins
                writeFile = false;
            }
            else {
                const propertyAssignments = tsquery.query(foundDefineConfig[0], 'PropertyAssignment');
                if (propertyAssignments.length) {
                    appFileContent = (0, devkit_1.applyChangesToString)(appFileContent, [
                        {
                            type: devkit_1.ChangeType.Insert,
                            index: propertyAssignments[0].getStart(),
                            text: `plugins: [${plugins.join(', ')}],`,
                        },
                    ]);
                    writeFile = true;
                }
                else {
                    appFileContent = (0, devkit_1.applyChangesToString)(appFileContent, [
                        {
                            type: devkit_1.ChangeType.Insert,
                            index: foundDefineConfig[0].getStart() + 14,
                            text: `plugins: [${plugins.join(', ')}],`,
                        },
                    ]);
                    writeFile = true;
                }
            }
        }
        else {
            // Plugins option does not exist and defineConfig is not used
            // could also potentially be invalid syntax, so try-catch
            try {
                const defaultExport = tsquery.query(file, 'ExportAssignment');
                const found = tsquery?.query(defaultExport?.[0], 'ObjectLiteralExpression');
                const startOfObject = found?.[0].getStart();
                appFileContent = (0, devkit_1.applyChangesToString)(appFileContent, [
                    {
                        type: devkit_1.ChangeType.Insert,
                        index: startOfObject + 1,
                        text: `plugins: [${plugins.join(', ')}],`,
                    },
                ]);
                writeFile = true;
            }
            catch {
                writeFile = false;
            }
        }
    }
    if (writeFile) {
        const filteredImports = filterImport(appFileContent, imports);
        return filteredImports.join(';\n') + '\n' + appFileContent;
    }
}
function filterImport(appFileContent, imports) {
    const { tsquery } = require('@phenomnomnominal/tsquery');
    const file = tsquery.ast(appFileContent);
    const importNodes = tsquery.query(file, ':matches(ImportDeclaration, VariableStatement)');
    const importsArrayExisting = importNodes?.map((node) => {
        return node.getText().slice(0, -1);
    });
    return imports.filter((importString) => {
        return !importsArrayExisting?.includes(importString);
    });
}
function handleCacheDirNode(appFileContent, cacheDir) {
    const { tsquery } = require('@phenomnomnominal/tsquery');
    const file = tsquery.ast(appFileContent);
    const cacheDirNode = tsquery.query(file, 'PropertyAssignment:has(Identifier[name="cacheDir"])');
    if (!cacheDirNode?.length || cacheDirNode?.length === 0) {
        // cacheDir node does not exist yet
        // So make one from scratch
        const foundDefineConfig = tsquery.query(file, 'CallExpression:has(Identifier[name="defineConfig"])');
        if (foundDefineConfig.length) {
            const conditionalConfig = tsquery.query(foundDefineConfig[0], 'ArrowFunction');
            if (conditionalConfig.length) {
                // We are NOT transforming the conditional config
                // with cacheDir
            }
            else {
                const propertyAssignments = tsquery.query(foundDefineConfig[0], 'PropertyAssignment');
                if (propertyAssignments.length) {
                    appFileContent = (0, devkit_1.applyChangesToString)(appFileContent, [
                        {
                            type: devkit_1.ChangeType.Insert,
                            index: propertyAssignments[0].getStart(),
                            text: cacheDir,
                        },
                    ]);
                }
                else {
                    appFileContent = (0, devkit_1.applyChangesToString)(appFileContent, [
                        {
                            type: devkit_1.ChangeType.Insert,
                            index: foundDefineConfig[0].getStart() + 14,
                            text: cacheDir,
                        },
                    ]);
                }
            }
        }
        else {
            // cacheDir option does not exist and defineConfig is not used
            // could also potentially be invalid syntax, so try-catch
            try {
                const defaultExport = tsquery.query(file, 'ExportAssignment');
                const found = tsquery?.query(defaultExport?.[0], 'ObjectLiteralExpression');
                const startOfObject = found?.[0].getStart();
                appFileContent = (0, devkit_1.applyChangesToString)(appFileContent, [
                    {
                        type: devkit_1.ChangeType.Insert,
                        index: startOfObject + 1,
                        text: cacheDir,
                    },
                ]);
            }
            catch { }
        }
    }
    return appFileContent;
}
