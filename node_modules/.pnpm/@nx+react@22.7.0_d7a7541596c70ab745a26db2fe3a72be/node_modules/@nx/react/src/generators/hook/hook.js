"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookGenerator = hookGenerator;
// TODO(jack): Remove inline renderHook function when RTL releases with its own version
const devkit_1 = require("@nx/devkit");
const artifact_name_and_directory_utils_1 = require("@nx/devkit/src/generators/artifact-name-and-directory-utils");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const path_1 = require("path");
const ast_utils_1 = require("../../utils/ast-utils");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
async function hookGenerator(host, schema) {
    const options = await normalizeOptions(host, schema);
    createFiles(host, options);
    addExportsToBarrel(host, options);
    return await (0, devkit_1.formatFiles)(host);
}
function createFiles(host, options) {
    const specExt = options.fileExtensionType === 'ts' ? 'tsx' : 'js';
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, './files'), options.directory, {
        ...options,
        ext: options.fileExtension,
        specExt,
        isTs: options.fileExtensionType === 'ts',
    });
    if (options.skipTests) {
        host.delete((0, devkit_1.joinPathFragments)(options.directory, `${options.fileName}.spec.${specExt}`));
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
        const indexFilePath = (0, devkit_1.joinPathFragments)(options.projectSourceRoot, options.fileExtensionType === 'js' ? 'index.js' : 'index.ts');
        if (!host.exists(indexFilePath)) {
            return;
        }
        const indexSource = host.read(indexFilePath, 'utf-8');
        const indexSourceFile = tsModule.createSourceFile(indexFilePath, indexSource, tsModule.ScriptTarget.Latest, true);
        const changes = (0, devkit_1.applyChangesToString)(indexSource, (0, ast_utils_1.addImport)(indexSourceFile, `export * from './${options.directory}/${options.fileName}';`));
        host.write(indexFilePath, changes);
    }
}
async function normalizeOptions(host, options) {
    const { artifactName, directory, fileName: hookFilename, fileExtension, fileExtensionType, project: projectName, } = await (0, artifact_name_and_directory_utils_1.determineArtifactNameAndDirectoryOptions)(host, {
        path: options.path,
        name: options.name,
        allowedFileExtensions: ['js', 'ts'],
        fileExtension: options.js ? 'js' : 'ts',
        js: options.js,
    });
    const { className } = (0, devkit_1.names)(hookFilename);
    // if name is provided, use it as is for the hook name, otherwise prepend
    // `use` to the pascal-cased file name if it doesn't already start with `use`
    const hookName = options.name
        ? artifactName
        : className.toLocaleLowerCase().startsWith('use')
            ? className
            : `use${className}`;
    const hookTypeName = (0, devkit_1.names)(hookName).className;
    const project = (0, devkit_1.getProjects)(host).get(projectName);
    const { root, sourceRoot: projectSourceRoot, projectType } = project;
    if (options.export &&
        (0, ts_solution_setup_1.getProjectType)(host, root, projectType) === 'application') {
        devkit_1.logger.warn(`The "--export" option should not be used with applications and will do nothing.`);
    }
    return {
        ...options,
        directory,
        hookName,
        hookTypeName,
        fileName: hookFilename,
        fileExtension,
        fileExtensionType,
        projectSourceRoot,
        projectName,
    };
}
exports.default = hookGenerator;
