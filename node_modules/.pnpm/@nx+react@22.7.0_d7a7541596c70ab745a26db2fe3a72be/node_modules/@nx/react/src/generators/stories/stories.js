"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRootPath = projectRootPath;
exports.containsComponentDeclaration = containsComponentDeclaration;
exports.createAllStories = createAllStories;
exports.storiesGenerator = storiesGenerator;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const minimatch_1 = require("minimatch");
const path_1 = require("path");
const ast_utils_1 = require("../../utils/ast-utils");
const framework_1 = require("../../utils/framework");
const component_story_1 = tslib_1.__importDefault(require("../component-story/component-story"));
let tsModule;
async function projectRootPath(tree, config) {
    let projectDir;
    if ((0, ts_solution_setup_1.getProjectType)(tree, config.root, config.projectType) === 'application') {
        const isNextJs = await isNextJsProject(tree, config);
        if (isNextJs) {
            // Next.js apps
            projectDir = 'components';
        }
        else {
            // apps/test-app/src/app
            projectDir = 'app';
        }
    }
    else if (config.projectType == 'library') {
        // libs/test-lib/src/lib
        projectDir = 'lib';
    }
    else {
        projectDir = '.';
    }
    return (0, devkit_1.joinPathFragments)((0, ts_solution_setup_1.getProjectSourceRoot)(config, tree), projectDir);
}
function containsComponentDeclaration(tree, componentPath) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const contents = tree.read(componentPath, 'utf-8');
    if (contents === null) {
        throw new Error(`Failed to read ${componentPath}`);
    }
    const sourceFile = tsModule.createSourceFile(componentPath, contents, tsModule.ScriptTarget.Latest, true);
    return !!((0, ast_utils_1.getComponentNode)(sourceFile) ||
        (0, ast_utils_1.findExportDeclarationsForJsx)(sourceFile)?.length);
}
async function createAllStories(tree, schema, projectConfiguration) {
    const { isTheFileAStory } = await Promise.resolve().then(() => tslib_1.__importStar(require('@nx/storybook/src/utils/utilities')));
    const sourceRoot = (0, ts_solution_setup_1.getProjectSourceRoot)(projectConfiguration, tree);
    let componentPaths = [];
    const projectPath = await projectRootPath(tree, projectConfiguration);
    (0, devkit_1.visitNotIgnoredFiles)(tree, projectPath, (path) => {
        // Ignore private files starting with "_".
        if ((0, path_1.basename)(path).startsWith('_'))
            return;
        if (schema.ignorePaths?.some((pattern) => (0, minimatch_1.minimatch)(path, pattern)))
            return;
        if ((path.endsWith('.tsx') && !path.endsWith('.spec.tsx')) ||
            (path.endsWith('.js') && !path.endsWith('.spec.js')) ||
            (path.endsWith('.jsx') && !path.endsWith('.spec.jsx'))) {
            // Check if file is NOT a story (either ts/tsx or js/jsx)
            if (!isTheFileAStory(tree, path)) {
                // Since the file is not a story
                // Let's see if the .stories.* file exists
                const ext = path.slice(path.lastIndexOf('.'));
                const storyPath = `${path.split(ext)[0]}.stories${ext}`;
                if (!tree.exists(storyPath)) {
                    componentPaths.push(path);
                }
            }
        }
    });
    await Promise.all(componentPaths.map(async (componentPath) => {
        const relativeCmpDir = componentPath.replace(`${sourceRoot.replace(/^\.\//, '')}/`, '');
        if (!containsComponentDeclaration(tree, componentPath)) {
            return;
        }
        await (0, component_story_1.default)(tree, {
            componentPath: relativeCmpDir,
            project: schema.project,
            interactionTests: schema.interactionTests,
            uiFramework: schema.uiFramework,
            skipFormat: true,
        });
    }));
}
async function storiesGenerator(host, schema) {
    const projects = (0, devkit_1.getProjects)(host);
    const projectConfiguration = projects.get(schema.project);
    schema.interactionTests = schema.interactionTests ?? true;
    schema.uiFramework ??= (0, framework_1.getUiFramework)(host, schema.project);
    await createAllStories(host, schema, projectConfiguration);
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(host);
    }
}
async function isNextJsProject(tree, config) {
    const { findStorybookAndBuildTargetsAndCompiler } = await Promise.resolve().then(() => tslib_1.__importStar(require('@nx/storybook/src/utils/utilities')));
    const { nextBuildTarget } = findStorybookAndBuildTargetsAndCompiler(config.targets);
    if (nextBuildTarget) {
        return true;
    }
    for (const configFile of ['next.config.js', 'next.config.ts']) {
        if (tree.exists((0, path_1.join)(config.root, configFile))) {
            return true;
        }
    }
    return false;
}
exports.default = storiesGenerator;
