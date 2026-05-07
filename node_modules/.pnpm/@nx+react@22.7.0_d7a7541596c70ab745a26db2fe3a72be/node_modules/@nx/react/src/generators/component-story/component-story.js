"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponentStoriesFile = createComponentStoriesFile;
exports.findPropsAndGenerateFile = findPropsAndGenerateFile;
exports.componentStoryGenerator = componentStoryGenerator;
const devkit_1 = require("@nx/devkit");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const ast_utils_1 = require("../../utils/ast-utils");
const component_props_1 = require("../../utils/component-props");
const framework_1 = require("../../utils/framework");
const path_1 = require("path");
let tsModule;
function createComponentStoriesFile(host, { project, componentPath, interactionTests, uiFramework, }) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const proj = (0, devkit_1.getProjects)(host).get(project);
    const componentFilePath = (0, devkit_1.joinPathFragments)((0, ts_solution_setup_1.getProjectSourceRoot)(proj, host), componentPath);
    const componentDirectory = componentFilePath.replace(componentFilePath.slice(componentFilePath.lastIndexOf('/')), '');
    const isPlainJs = componentFilePath.endsWith('.jsx') || componentFilePath.endsWith('.js');
    const componentFileName = componentFilePath
        .slice(componentFilePath.lastIndexOf('/') + 1)
        .replace('.tsx', '')
        .replace('.jsx', '')
        .replace('.js', '');
    const name = componentFileName;
    const contents = host.read(componentFilePath, 'utf-8');
    if (contents === null) {
        throw new Error(`Failed to read ${componentFilePath}`);
    }
    const sourceFile = tsModule.createSourceFile(componentFilePath, contents, tsModule.ScriptTarget.Latest, true);
    const cmpDeclaration = (0, ast_utils_1.getComponentNode)(sourceFile);
    if (!cmpDeclaration) {
        const componentNodes = (0, ast_utils_1.findExportDeclarationsForJsx)(sourceFile);
        if (componentNodes?.length) {
            componentNodes.forEach((declaration) => {
                findPropsAndGenerateFile(host, sourceFile, declaration, componentDirectory, name, interactionTests, uiFramework, isPlainJs, componentNodes.length > 1);
            });
        }
        else {
            throw new Error(`Could not find any React component in file ${componentFilePath}`);
        }
    }
    else {
        findPropsAndGenerateFile(host, sourceFile, cmpDeclaration, componentDirectory, name, interactionTests, uiFramework, isPlainJs);
    }
}
function findPropsAndGenerateFile(host, sourceFile, cmpDeclaration, componentDirectory, name, interactionTests, uiFramework, isPlainJs, fromNodeArray) {
    const { props, argTypes } = (0, component_props_1.getComponentPropDefaults)(sourceFile, cmpDeclaration);
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, `./files${isPlainJs ? '/jsx' : '/tsx'}`), (0, devkit_1.normalizePath)(componentDirectory), {
        tmpl: '',
        componentFileName: fromNodeArray
            ? `${name}--${cmpDeclaration.name.text}`
            : name,
        componentImportFileName: name,
        props,
        argTypes,
        componentName: cmpDeclaration.name.text,
        interactionTests,
        uiFramework,
    });
}
async function componentStoryGenerator(host, schema) {
    createComponentStoriesFile(host, {
        ...schema,
        interactionTests: schema.interactionTests ?? true,
        uiFramework: schema.uiFramework ?? (0, framework_1.getUiFramework)(host, schema.project),
    });
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(host);
    }
}
exports.default = componentStoryGenerator;
