"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentGenerator = componentGenerator;
const devkit_1 = require("@nx/devkit");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const path_1 = require("path");
const add_styled_dependencies_1 = require("../../rules/add-styled-dependencies");
const ast_utils_1 = require("../../utils/ast-utils");
const get_in_source_vitest_tests_template_1 = require("../../utils/get-in-source-vitest-tests-template");
const versions_1 = require("../../utils/versions");
const get_component_tests_1 = require("./lib/get-component-tests");
const normalize_options_1 = require("./lib/normalize-options");
async function componentGenerator(host, schema) {
    const options = await (0, normalize_options_1.normalizeOptions)(host, schema);
    createComponentFiles(host, options);
    const tasks = [];
    const styledTask = (0, add_styled_dependencies_1.addStyledModuleDependencies)(host, options);
    tasks.push(styledTask);
    addExportsToBarrel(host, options);
    if (options.routing) {
        const routingTask = (0, devkit_1.addDependenciesToPackageJson)(host, { 'react-router-dom': versions_1.reactRouterDomVersion }, {});
        tasks.push(routingTask);
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(host);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
function createComponentFiles(host, options) {
    const componentTests = (0, get_component_tests_1.getComponentTests)(options);
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, './files'), options.directory, {
        ...options,
        componentTests,
        inSourceVitestTests: (0, get_in_source_vitest_tests_template_1.getInSourceVitestTestsTemplate)(componentTests),
        isTs: options.fileExtensionType === 'ts',
        ext: options.fileExtension,
    });
    if (options.skipTests || options.inSourceTests) {
        host.delete((0, devkit_1.joinPathFragments)(options.directory, `${options.fileName}.spec.${options.fileExtension}`));
    }
    if (options.styledModule || !options.hasStyles || !options.globalCss) {
        host.delete((0, path_1.join)(options.directory, `${options.fileName}.${options.style}`));
    }
    if (options.styledModule || !options.hasStyles || options.globalCss) {
        host.delete((0, path_1.join)(options.directory, `${options.fileName}.module.${options.style}`));
    }
}
let tsModule;
function addExportsToBarrel(host, options) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const workspace = (0, devkit_1.getProjects)(host);
    const isApp = workspace.get(options.projectName).projectType === 'application';
    if (options.export && !isApp) {
        const indexFilePath = (0, devkit_1.joinPathFragments)(...(options.projectSourceRoot
            ? [options.projectSourceRoot]
            : [options.projectRoot, 'src']), options.fileExtensionType === 'js' ? 'index.js' : 'index.ts');
        if (!host.exists(indexFilePath)) {
            return;
        }
        const indexSource = host.read(indexFilePath, 'utf-8');
        const indexSourceFile = tsModule.createSourceFile(indexFilePath, indexSource, tsModule.ScriptTarget.Latest, true);
        const relativePathFromIndex = getRelativeImportToFile(indexFilePath, options.filePath);
        const changes = (0, devkit_1.applyChangesToString)(indexSource, (0, ast_utils_1.addImport)(indexSourceFile, `export * from '${relativePathFromIndex}';`));
        host.write(indexFilePath, changes);
    }
}
function getRelativeImportToFile(indexPath, filePath) {
    const { name, dir } = (0, path_1.parse)(filePath);
    const relativeDirToTarget = (0, path_1.relative)((0, path_1.dirname)(indexPath), dir);
    return `./${(0, devkit_1.joinPathFragments)(relativeDirToTarget, name)}`;
}
exports.default = componentGenerator;
