"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const artifact_name_and_directory_utils_1 = require("@nx/devkit/src/generators/artifact-name-and-directory-utils");
const assertion_1 = require("../../../utils/assertion");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
async function normalizeOptions(tree, options) {
    (0, assertion_1.assertValidStyle)(options.style);
    const { artifactName: name, directory, fileName, filePath, fileExtension, fileExtensionType, project: projectName, } = await (0, artifact_name_and_directory_utils_1.determineArtifactNameAndDirectoryOptions)(tree, {
        path: options.path,
        name: options.name,
        allowedFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
        fileExtension: options.js ? 'js' : 'tsx',
        js: options.js,
    });
    const project = (0, devkit_1.readProjectConfiguration)(tree, projectName);
    const { className } = (0, devkit_1.names)(name);
    const { sourceRoot: projectSourceRoot, root: projectRoot, projectType, } = project;
    const styledModule = /^(css|scss|less|none)$/.test(options.style)
        ? null
        : options.style;
    if (options.export &&
        (0, ts_solution_setup_1.getProjectType)(tree, projectRoot, projectType) === 'application') {
        devkit_1.logger.warn(`The "--export" option should not be used with applications and will do nothing.`);
    }
    options.classComponent = options.classComponent ?? false;
    options.routing = options.routing ?? false;
    options.globalCss = options.globalCss ?? false;
    options.inSourceTests = options.inSourceTests ?? false;
    //TODO (nicholas): Remove when Next page generator is removed
    options.isNextPage = options.isNextPage ?? false;
    return {
        ...options,
        directory,
        projectName,
        styledModule,
        hasStyles: options.style !== 'none',
        className,
        fileName,
        filePath,
        projectRoot,
        projectSourceRoot,
        fileExtension,
        fileExtensionType,
    };
}
