"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduxGenerator = reduxGenerator;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const artifact_name_and_directory_utils_1 = require("@nx/devkit/src/generators/artifact-name-and-directory-utils");
const js_1 = require("@nx/js");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const path = tslib_1.__importStar(require("path"));
const ast_utils_1 = require("../../utils/ast-utils");
const versions_1 = require("../../utils/versions");
let tsModule;
async function reduxGenerator(host, schema) {
    const options = await normalizeOptions(host, schema);
    generateReduxFiles(host, options);
    addExportsToBarrel(host, options);
    const installTask = addReduxPackageDependencies(host);
    addStoreConfiguration(host, options);
    updateReducerConfiguration(host, options);
    await (0, devkit_1.formatFiles)(host);
    return installTask;
}
function generateReduxFiles(host, options) {
    (0, devkit_1.generateFiles)(host, (0, devkit_1.joinPathFragments)(__dirname, 'files', options.fileExtensionType), options.projectDirectory, {
        ...options,
        ext: options.fileExtension,
    });
}
function addReduxPackageDependencies(host) {
    return (0, devkit_1.addDependenciesToPackageJson)(host, {
        '@reduxjs/toolkit': versions_1.reduxjsToolkitVersion,
        'react-redux': versions_1.reactReduxVersion,
    }, {});
}
function addExportsToBarrel(host, options) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const indexFilePath = (0, devkit_1.joinPathFragments)(options.projectSourcePath, options.fileExtensionType === 'js' ? 'index.js' : 'index.ts');
    if (!host.exists(indexFilePath)) {
        return;
    }
    const indexSource = host.read(indexFilePath, 'utf-8');
    const indexSourceFile = tsModule.createSourceFile(indexFilePath, indexSource, tsModule.ScriptTarget.Latest, true);
    const statePath = options.path
        ? `./lib/${options.path}/${options.fileName}`
        : `./lib/${options.fileName}`;
    const changes = (0, devkit_1.applyChangesToString)(indexSource, (0, ast_utils_1.addImport)(indexSourceFile, `export * from '${statePath}.slice';`));
    host.write(indexFilePath, changes);
}
function addStoreConfiguration(host, options) {
    if (!options.appProjectSourcePath) {
        return;
    }
    const mainSource = host.read(options.appMainFilePath, 'utf-8');
    if (!mainSource.includes('redux')) {
        const mainSourceFile = tsModule.createSourceFile(options.appMainFilePath, mainSource, tsModule.ScriptTarget.Latest, true);
        const changes = (0, devkit_1.applyChangesToString)(mainSource, (0, ast_utils_1.addReduxStoreToMain)(options.appMainFilePath, mainSourceFile));
        host.write(options.appMainFilePath, changes);
    }
}
function updateReducerConfiguration(host, options) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    if (!options.appProjectSourcePath) {
        return;
    }
    const mainSource = host.read(options.appMainFilePath, 'utf-8');
    const mainSourceFile = tsModule.createSourceFile(options.appMainFilePath, mainSource, tsModule.ScriptTarget.Latest, true);
    const changes = (0, devkit_1.applyChangesToString)(mainSource, (0, ast_utils_1.updateReduxStore)(options.appMainFilePath, mainSourceFile, {
        keyName: `${options.constantName}_FEATURE_KEY`,
        reducerName: `${options.propertyName}Reducer`,
        modulePath: `${options.projectModulePath}`,
    }));
    host.write(options.appMainFilePath, changes);
}
async function normalizeOptions(host, options) {
    const { artifactName: name, directory, fileName, fileExtension, fileExtensionType, project: projectName, } = await (0, artifact_name_and_directory_utils_1.determineArtifactNameAndDirectoryOptions)(host, {
        path: options.path,
        name: options.name,
        suffix: 'slice',
        allowedFileExtensions: ['js', 'ts'],
        fileExtension: options.js ? 'js' : 'ts',
        js: options.js,
    });
    let appProjectSourcePath;
    let appMainFilePath;
    const extraNames = (0, devkit_1.names)(name);
    const projects = (0, devkit_1.getProjects)(host);
    const project = projects.get(projectName);
    const { root, sourceRoot, projectType } = project;
    const tsConfigJson = (0, devkit_1.readJson)(host, (0, js_1.getRootTsConfigPathInTree)(host));
    const tsPaths = tsConfigJson.compilerOptions
        ? tsConfigJson.compilerOptions.paths || {}
        : {};
    const modulePath = (0, ts_solution_setup_1.getProjectType)(host, root, projectType) === 'application'
        ? options.path
            ? `./app/${options.path}/${extraNames.fileName}.slice`
            : `./app/${extraNames.fileName}.slice`
        : Object.keys(tsPaths).find((k) => tsPaths[k].some((s) => s.includes(sourceRoot)));
    // If --project is set to an app, automatically configure store
    // for it without needing to specify --appProject.
    options.appProject =
        options.appProject ||
            (projectType === 'application' ? projectName : undefined);
    if (options.appProject) {
        const appConfig = projects.get(options.appProject);
        if (appConfig.projectType !== 'application') {
            throw new Error(`Expected ${options.appProject} to be an application but got ${appConfig.projectType}`);
        }
        appProjectSourcePath = (0, ts_solution_setup_1.getProjectSourceRoot)(appConfig, host);
        appMainFilePath = path.join(appProjectSourcePath, options.js ? 'main.js' : 'main.tsx');
        if (!host.exists(appMainFilePath)) {
            throw new Error(`Could not find ${appMainFilePath} during store configuration`);
        }
    }
    return {
        ...options,
        ...extraNames,
        fileName,
        fileExtension,
        fileExtensionType,
        constantName: (0, devkit_1.names)(name).constantName.toUpperCase(),
        projectDirectory: directory,
        projectType,
        projectSourcePath: sourceRoot,
        projectModulePath: modulePath,
        appProjectSourcePath,
        appMainFilePath,
    };
}
exports.default = reduxGenerator;
