"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLinting = addLinting;
const eslint_1 = require("@nx/eslint");
const path_1 = require("nx/src/utils/path");
const devkit_1 = require("@nx/devkit");
const lint_1 = require("../../../utils/lint");
const eslint_file_1 = require("@nx/eslint/src/generators/utils/eslint-file");
const flat_config_1 = require("@nx/eslint/src/utils/flat-config");
async function addLinting(host, options) {
    if (options.linter === 'eslint') {
        const tasks = [];
        const lintTask = await (0, eslint_1.lintProjectGenerator)(host, {
            linter: options.linter,
            project: options.name,
            tsConfigPaths: [
                (0, path_1.joinPathFragments)(options.projectRoot, 'tsconfig.lib.json'),
            ],
            unitTestRunner: options.unitTestRunner,
            skipFormat: true,
            skipPackageJson: options.skipPackageJson,
            setParserOptionsProject: options.setParserOptionsProject,
            addPlugin: options.addPlugin,
        });
        tasks.push(lintTask);
        if ((0, eslint_file_1.isEslintConfigSupported)(host)) {
            if ((0, flat_config_1.useFlatConfig)(host)) {
                (0, eslint_file_1.addPredefinedConfigToFlatLintConfig)(host, options.projectRoot, 'flat/react', { checkBaseConfig: true });
                // Add an empty rules object to users know how to add/override rules
                (0, eslint_file_1.addOverrideToLintConfig)(host, options.projectRoot, {
                    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
                    rules: {},
                });
            }
            else {
                const addExtendsTask = (0, eslint_file_1.addExtendsToLintConfig)(host, options.projectRoot, {
                    name: 'plugin:@nx/react',
                    needCompatFixup: true,
                });
                tasks.push(addExtendsTask);
            }
            // Add out-tsc ignore pattern when using TS solution setup
            if (options.isUsingTsSolutionConfig) {
                (0, eslint_file_1.addIgnoresToLintConfig)(host, options.projectRoot, ['**/out-tsc']);
            }
        }
        let installTask = () => { };
        if (!options.skipPackageJson) {
            installTask = (0, devkit_1.addDependenciesToPackageJson)(host, lint_1.extraEslintDependencies.dependencies, lint_1.extraEslintDependencies.devDependencies);
            tasks.push(installTask);
        }
        return (0, devkit_1.runTasksInSerial)(...tasks);
    }
    else {
        return () => { };
    }
}
