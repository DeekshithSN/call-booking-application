"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultTemplateVariables = getDefaultTemplateVariables;
exports.createNxRspackPluginOptions = createNxRspackPluginOptions;
exports.createApplicationFiles = createApplicationFiles;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const path_1 = require("path");
const create_ts_config_1 = require("../../../utils/create-ts-config");
const get_in_source_vitest_tests_template_1 = require("../../../utils/get-in-source-vitest-tests-template");
const maybe_js_1 = require("../../../utils/maybe-js");
const has_webpack_plugin_1 = require("../../../utils/has-webpack-plugin");
const get_app_tests_1 = require("./get-app-tests");
const onboarding_1 = require("nx/src/nx-cloud/utilities/onboarding");
const has_rspack_plugin_1 = require("../../../utils/has-rspack-plugin");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const versions_1 = require("../../../utils/versions");
function getDefaultTemplateVariables(host, options) {
    const hasStyleFile = ['scss', 'css', 'less'].includes(options.style);
    const appTests = (0, get_app_tests_1.getAppTests)(options);
    return {
        ...options.names,
        ...options,
        typesNodeVersion: versions_1.typesNodeVersion,
        typesReactDomVersion: versions_1.typesReactDomVersion,
        reactRouterVersion: versions_1.reactRouterVersion,
        typesReactVersion: versions_1.typesReactVersion,
        reactDomVersion: versions_1.reactDomVersion,
        reactVersion: versions_1.reactVersion,
        reactRouterIsBotVersion: versions_1.reactRouterIsBotVersion,
        js: !!options.js, // Ensure this is defined in template
        tmpl: '',
        offsetFromRoot: (0, devkit_1.offsetFromRoot)(options.appProjectRoot),
        appTests,
        inSourceVitestTests: (0, get_in_source_vitest_tests_template_1.getInSourceVitestTestsTemplate)(appTests),
        style: options.style === 'tailwind' ? 'css' : options.style,
        hasStyleFile,
        isUsingTsSolutionSetup: (0, ts_solution_setup_1.isUsingTsSolutionSetup)(host),
        port: options.port ?? 4200,
    };
}
function createNxRspackPluginOptions(options, rootOffset, tsx = true) {
    return {
        target: 'web',
        outputPath: options.isUsingTsSolutionConfig
            ? 'dist'
            : (0, devkit_1.joinPathFragments)(rootOffset, 'dist', options.appProjectRoot != '.'
                ? options.appProjectRoot
                : options.projectName),
        index: './src/index.html',
        baseHref: '/',
        main: (0, maybe_js_1.maybeJs)({
            js: options.js,
            useJsx: true,
        }, `./src/main.${tsx ? 'tsx' : 'ts'}`),
        tsConfig: './tsconfig.app.json',
        assets: ['./src/favicon.ico', './src/assets'],
        styles: options.styledModule || !options.hasStyles
            ? []
            : [
                `./src/styles.${options.style !== 'tailwind' ? options.style : 'css'}`,
            ],
    };
}
async function createApplicationFiles(host, options) {
    let styleSolutionSpecificAppFiles;
    if (options.styledModule && options.style !== 'styled-jsx') {
        styleSolutionSpecificAppFiles = '../files/style-styled-module';
    }
    else if (options.style === 'styled-jsx') {
        styleSolutionSpecificAppFiles = '../files/style-styled-jsx';
    }
    else if (options.style === 'tailwind') {
        styleSolutionSpecificAppFiles = '../files/style-tailwind';
    }
    else if (options.style === 'none') {
        styleSolutionSpecificAppFiles = '../files/style-none';
    }
    else if (options.globalCss) {
        styleSolutionSpecificAppFiles = '../files/style-global-css';
    }
    else {
        styleSolutionSpecificAppFiles = '../files/style-css-module';
    }
    const onBoardingStatus = await (0, onboarding_1.createNxCloudOnboardingURLForWelcomeApp)(host, options.nxCloudToken);
    const connectCloudUrl = onBoardingStatus === 'unclaimed' &&
        (await (0, onboarding_1.getNxCloudAppOnBoardingUrl)(options.nxCloudToken));
    const relativePathToRootTsConfig = (0, js_1.getRelativePathToRootTsConfig)(host, options.appProjectRoot);
    const templateVariables = getDefaultTemplateVariables(host, options);
    if (options.bundler === 'vite' && !options.useReactRouter) {
        (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, '../files/base-vite'), options.appProjectRoot, templateVariables);
    }
    else if (options.bundler === 'vite' && options.useReactRouter) {
        generateReactRouterFiles(host, options, templateVariables);
    }
    else if (options.bundler === 'webpack') {
        (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, '../files/base-webpack'), options.appProjectRoot, {
            ...templateVariables,
            webpackPluginOptions: (0, has_webpack_plugin_1.hasWebpackPlugin)(host)
                ? createNxWebpackPluginOptions(options, templateVariables.offsetFromRoot)
                : null,
        });
        if (options.compiler === 'babel') {
            (0, devkit_1.writeJson)(host, `${options.appProjectRoot}/.babelrc`, {
                presets: [
                    [
                        '@nx/react/babel',
                        {
                            runtime: 'automatic',
                            importSource: options.style === '@emotion/styled'
                                ? '@emotion/react'
                                : undefined,
                        },
                    ],
                ],
                plugins: [
                    options.style === 'styled-components'
                        ? ['styled-components', { pure: true, ssr: true }]
                        : undefined,
                    options.style === 'styled-jsx' ? 'styled-jsx/babel' : undefined,
                    options.style === '@emotion/styled'
                        ? '@emotion/babel-plugin'
                        : undefined,
                ].filter(Boolean),
            });
        }
        else if (options.compiler === 'swc') {
            const swcrc = {
                jsc: {
                    target: 'es2016',
                },
            };
            if (options.style === 'styled-components') {
                swcrc.jsc.experimental = {
                    plugins: [
                        [
                            '@swc/plugin-styled-components',
                            {
                                displayName: true,
                                ssr: true,
                            },
                        ],
                    ],
                };
            }
            else if (options.style === '@emotion/styled') {
                swcrc.jsc.experimental = {
                    plugins: [['@swc/plugin-emotion', {}]],
                };
            }
            else if (options.style === 'styled-jsx') {
                swcrc.jsc.experimental = {
                    plugins: [['@swc/plugin-styled-jsx', {}]],
                };
            }
            (0, devkit_1.writeJson)(host, `${options.appProjectRoot}/.swcrc`, swcrc);
        }
    }
    else if (options.bundler === 'rspack') {
        (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, '../files/base-rspack'), options.appProjectRoot, {
            ...templateVariables,
            rspackPluginOptions: (0, has_rspack_plugin_1.hasRspackPlugin)(host)
                ? createNxRspackPluginOptions(options, templateVariables.offsetFromRoot)
                : null,
        });
    }
    else if (options.bundler === 'rsbuild') {
        (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, '../files/base-rsbuild'), options.appProjectRoot, {
            ...templateVariables,
        });
    }
    if (options.unitTestRunner === 'none' ||
        (options.unitTestRunner === 'vitest' && options.inSourceTests == true)) {
        host.delete(`${options.appProjectRoot}/src/app/${options.fileName}.spec.tsx`);
    }
    if (!options.minimal) {
        const tutorialUrl = options.rootProject
            ? 'https://nx.dev/getting-started/tutorials/react-standalone-tutorial'
            : 'https://nx.dev/react-tutorial/1-code-generation?utm_source=nx-project';
        const path = options.useReactRouter
            ? '../files/react-router-ssr/nx-welcome'
            : '../files/nx-welcome';
        (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, path, onBoardingStatus), options.appProjectRoot, { ...templateVariables, connectCloudUrl, tutorialUrl });
    }
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, styleSolutionSpecificAppFiles, options.useReactRouter ? 'src' : ''), options.appProjectRoot, templateVariables);
    if (options.js) {
        (0, devkit_1.toJS)(host, {
            useJsx: options.bundler === 'vite' || options.bundler === 'rspack',
        });
    }
    (0, create_ts_config_1.createTsConfig)(host, options.appProjectRoot, 'app', options, relativePathToRootTsConfig);
}
function createNxWebpackPluginOptions(options, rootOffset) {
    return {
        target: 'web',
        compiler: options.compiler ?? 'babel',
        outputPath: options.isUsingTsSolutionConfig
            ? 'dist'
            : (0, devkit_1.joinPathFragments)(rootOffset, 'dist', options.appProjectRoot != '.'
                ? options.appProjectRoot
                : options.projectName),
        index: './src/index.html',
        baseHref: '/',
        main: (0, maybe_js_1.maybeJs)({
            js: options.js,
            useJsx: options.bundler === 'vite' || options.bundler === 'rspack',
        }, `./src/main.tsx`),
        tsConfig: './tsconfig.app.json',
        assets: ['./src/favicon.ico', './src/assets'],
        styles: options.styledModule || !options.hasStyles
            ? []
            : [
                `./src/styles.${options.style !== 'tailwind' ? options.style : 'css'}`,
            ],
    };
}
function generateReactRouterFiles(tree, options, templateVariables) {
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, '../files/react-router-ssr/common'), options.appProjectRoot, templateVariables);
    if (options.rootProject) {
        const gitignore = tree.read('.gitignore', 'utf-8');
        tree.write('.gitignore', `${gitignore}\n.cache\nbuild\npublic/build\n.env\n\.react-router\n`);
    }
    else {
        (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, '../files/react-router-ssr/non-root'), options.appProjectRoot, templateVariables);
    }
    if (options.isUsingTsSolutionConfig) {
        (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, '../files/react-router-ssr/ts-solution'), options.appProjectRoot, templateVariables);
        (0, devkit_1.updateJson)(tree, (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'package.json'), (json) => {
            if (options.projectName !== options.importPath) {
                json.nx = { name: options.projectName };
            }
            if (options.parsedTags?.length) {
                json.nx ??= {};
                json.nx.tags = options.parsedTags;
            }
            return json;
        });
    }
}
