"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToFlatConfigGenerator = convertToFlatConfigGenerator;
const devkit_1 = require("@nx/devkit");
const eslint_file_1 = require("../utils/eslint-file");
const plugin_1 = require("../utils/plugin");
const path_1 = require("path");
const versions_1 = require("../../utils/versions");
const json_converter_1 = require("./converters/json-converter");
async function convertToFlatConfigGenerator(tree, options) {
    const eslintFile = (0, eslint_file_1.findEslintFile)(tree);
    if (!eslintFile) {
        throw new Error('Could not find root eslint file');
    }
    if (eslintFile.endsWith('.js')) {
        throw new Error('Only json and yaml eslint config files are supported for conversion');
    }
    options.eslintConfigFormat ??= 'mjs';
    const eslintIgnoreFiles = new Set(['.eslintignore']);
    // convert root eslint config to eslint.config.cjs or eslint.base.config.mjs based on eslintConfigFormat
    convertRootToFlatConfig(tree, eslintFile, options.eslintConfigFormat);
    // convert project eslint files to eslint.config.cjs
    const projects = (0, devkit_1.getProjects)(tree);
    for (const [project, projectConfig] of projects) {
        convertProjectToFlatConfig(tree, project, projectConfig, (0, devkit_1.readNxJson)(tree), eslintIgnoreFiles, options.eslintConfigFormat);
    }
    // delete all .eslintignore files
    for (const ignoreFile of eslintIgnoreFiles) {
        tree.delete(ignoreFile);
    }
    // replace references in nx.json
    updateNxJsonConfig(tree, options.eslintConfigFormat);
    // install missing packages
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return () => (0, devkit_1.installPackagesTask)(tree);
}
exports.default = convertToFlatConfigGenerator;
function convertRootToFlatConfig(tree, eslintFile, format) {
    if (/\.base\.(js|json|yml|yaml)$/.test(eslintFile)) {
        convertConfigToFlatConfig(tree, '', eslintFile, `eslint.base.config.${format}`, format);
    }
    convertConfigToFlatConfig(tree, '', eslintFile.replace('.base.', '.'), `eslint.config.${format}`, format);
}
const ESLINT_LINT_EXECUTOR = '@nx/eslint:lint';
function isEslintTarget(target) {
    return (target.executor === ESLINT_LINT_EXECUTOR ||
        target.command?.includes('eslint'));
}
function convertProjectToFlatConfig(tree, project, projectConfig, nxJson, eslintIgnoreFiles, format) {
    const eslintFile = (0, eslint_file_1.findEslintFile)(tree, projectConfig.root);
    if (!eslintFile || eslintFile.endsWith('.js')) {
        return;
    }
    // Clean up obsolete target options and detect explicit ESLint targets
    let ignorePath;
    const eslintTargets = projectConfig.targets
        ? Object.keys(projectConfig.targets).filter((t) => isEslintTarget(projectConfig.targets[t]))
        : [];
    for (const target of eslintTargets) {
        if (projectConfig.targets[target].options?.eslintConfig) {
            delete projectConfig.targets[target].options.eslintConfig;
        }
        if (projectConfig.targets[target].options?.ignorePath) {
            ignorePath = projectConfig.targets[target].options.ignorePath;
            delete projectConfig.targets[target].options.ignorePath;
        }
    }
    if (eslintTargets.length > 0) {
        (0, devkit_1.updateProjectConfiguration)(tree, project, projectConfig);
    }
    const hasEslintTargetDefaults = projectConfig.targets &&
        Object.keys(nxJson.targetDefaults || {}).some((t) => (t === ESLINT_LINT_EXECUTOR ||
            isEslintTarget(nxJson.targetDefaults[t])) &&
            projectConfig.targets[t]);
    if (eslintTargets.length === 0 &&
        !hasEslintTargetDefaults &&
        !(0, plugin_1.hasEslintPlugin)(tree)) {
        devkit_1.logger.warn(`Skipping "${project}": found ${eslintFile} but no ESLint lint target detected. Convert manually if needed.`);
        return;
    }
    convertConfigToFlatConfig(tree, projectConfig.root, eslintFile, `eslint.config.${format}`, format, ignorePath);
    eslintIgnoreFiles.add(`${projectConfig.root}/.eslintignore`);
    if (ignorePath) {
        eslintIgnoreFiles.add(ignorePath);
    }
}
// update names of eslint files in nx.json
// and remove eslintignore
function updateNxJsonConfig(tree, format) {
    if (tree.exists('nx.json')) {
        (0, devkit_1.updateJson)(tree, 'nx.json', (json) => {
            if (json.targetDefaults?.lint?.inputs) {
                const inputSet = new Set(json.targetDefaults.lint.inputs);
                inputSet.add(`{workspaceRoot}/eslint.config.${format}`);
                json.targetDefaults.lint.inputs = Array.from(inputSet);
            }
            if (json.targetDefaults?.['@nx/eslint:lint']?.inputs) {
                const inputSet = new Set(json.targetDefaults['@nx/eslint:lint'].inputs);
                inputSet.add(`{workspaceRoot}/eslint.config.${format}`);
                json.targetDefaults['@nx/eslint:lint'].inputs = Array.from(inputSet);
            }
            if (json.namedInputs?.production) {
                const inputSet = new Set(json.namedInputs.production);
                inputSet.add(`!{projectRoot}/eslint.config.${format}`);
                json.namedInputs.production = Array.from(inputSet);
            }
            return json;
        });
    }
}
function convertConfigToFlatConfig(tree, root, source, target, format, ignorePath) {
    const ignorePaths = ignorePath
        ? [ignorePath, `${root}/.eslintignore`]
        : [`${root}/.eslintignore`];
    if (source.endsWith('.json')) {
        const config = (0, devkit_1.readJson)(tree, `${root}/${source}`);
        const conversionResult = (0, json_converter_1.convertEslintJsonToFlatConfig)(tree, root, config, ignorePaths, format);
        return processConvertedConfig(tree, root, source, target, conversionResult);
    }
    if (source.endsWith('.yaml') || source.endsWith('.yml')) {
        const originalContent = tree.read(`${root}/${source}`, 'utf-8');
        const { load } = require('@zkochan/js-yaml');
        const config = load(originalContent, {
            json: true,
            filename: source,
        });
        const conversionResult = (0, json_converter_1.convertEslintJsonToFlatConfig)(tree, root, config, ignorePaths, format);
        return processConvertedConfig(tree, root, source, target, conversionResult);
    }
}
function processConvertedConfig(tree, root, source, target, { content, addESLintRC, addESLintJS, }) {
    // remove original config file
    tree.delete((0, path_1.join)(root, source));
    // save new
    tree.write((0, path_1.join)(root, target), content);
    // These dependencies are required for flat configs that are generated by subsequent app/lib generators.
    const devDependencies = {
        eslint: versions_1.eslint9__eslintVersion,
        'eslint-config-prettier': versions_1.eslintConfigPrettierVersion,
        'typescript-eslint': versions_1.eslint9__typescriptESLintVersion,
        '@typescript-eslint/eslint-plugin': versions_1.eslint9__typescriptESLintVersion,
        '@typescript-eslint/parser': versions_1.eslint9__typescriptESLintVersion,
    };
    if ((0, devkit_1.getDependencyVersionFromPackageJson)(tree, '@typescript-eslint/utils')) {
        devDependencies['@typescript-eslint/utils'] =
            versions_1.eslint9__typescriptESLintVersion;
    }
    if ((0, devkit_1.getDependencyVersionFromPackageJson)(tree, '@typescript-eslint/type-utils')) {
        devDependencies['@typescript-eslint/type-utils'] =
            versions_1.eslint9__typescriptESLintVersion;
    }
    // add missing packages
    if (addESLintRC) {
        devDependencies['@eslint/eslintrc'] = versions_1.eslintrcVersion;
    }
    if (addESLintJS) {
        devDependencies['@eslint/js'] = versions_1.eslintVersion;
    }
    (0, devkit_1.addDependenciesToPackageJson)(tree, {}, devDependencies);
}
