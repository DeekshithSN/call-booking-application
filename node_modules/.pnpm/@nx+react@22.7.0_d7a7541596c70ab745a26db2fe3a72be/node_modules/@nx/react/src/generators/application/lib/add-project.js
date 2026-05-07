"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProject = addProject;
const devkit_1 = require("@nx/devkit");
const has_webpack_plugin_1 = require("../../../utils/has-webpack-plugin");
const maybe_js_1 = require("../../../utils/maybe-js");
const has_rspack_plugin_1 = require("../../../utils/has-rspack-plugin");
function addProject(host, options) {
    const project = {
        root: options.appProjectRoot,
        sourceRoot: `${options.appProjectRoot}/src`,
        projectType: 'application',
        targets: {},
        tags: options.parsedTags,
    };
    if (options.bundler === 'webpack') {
        if (!(0, has_webpack_plugin_1.hasWebpackPlugin)(host) || !options.addPlugin) {
            project.targets = {
                build: createBuildTarget(options),
                serve: createServeTarget(options),
            };
        }
    }
    else if (options.bundler === 'rspack' &&
        (!(0, has_rspack_plugin_1.hasRspackPlugin)(host) || !options.addPlugin)) {
        project.targets = {
            build: createRspackBuildTarget(options),
            serve: createRspackServeTarget(options),
        };
    }
    const packageJson = {
        name: options.importPath,
        version: '0.0.1',
        private: true,
    };
    if (!options.useProjectJson) {
        if (options.projectName !== options.importPath) {
            packageJson.nx = { name: options.projectName };
        }
        if (Object.keys(project.targets).length) {
            packageJson.nx ??= {};
            packageJson.nx.sourceRoot = (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src');
            packageJson.nx.targets = project.targets;
        }
        if (options.parsedTags?.length) {
            packageJson.nx ??= {};
            packageJson.nx.tags = options.parsedTags;
        }
    }
    else {
        (0, devkit_1.addProjectConfiguration)(host, options.projectName, {
            ...project,
        });
    }
    if (!options.useProjectJson || options.isUsingTsSolutionConfig) {
        // React Router already adds a package.json to the project root
        if (options.useReactRouter) {
            (0, devkit_1.updateJson)(host, (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'package.json'), (json) => {
                return {
                    name: packageJson.name,
                    ...json,
                };
            });
        }
        else {
            (0, devkit_1.writeJson)(host, (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'package.json'), packageJson);
        }
    }
}
function createRspackBuildTarget(options) {
    return {
        executor: '@nx/rspack:rspack',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
            outputPath: options.isUsingTsSolutionConfig
                ? (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'dist')
                : (0, devkit_1.joinPathFragments)('dist', options.appProjectRoot !== '.'
                    ? options.appProjectRoot
                    : options.projectName),
            index: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/index.html'),
            baseHref: '/',
            main: (0, devkit_1.joinPathFragments)(options.appProjectRoot, (0, maybe_js_1.maybeJs)(options, `src/main.tsx`)),
            tsConfig: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.app.json'),
            assets: [
                (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/favicon.ico'),
                (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/assets'),
            ],
            rspackConfig: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'rspack.config.js'),
            styles: options.styledModule || !options.hasStyles
                ? []
                : [
                    (0, devkit_1.joinPathFragments)(options.appProjectRoot, `src/styles.${options.style === 'tailwind' ? 'css' : options.style}`),
                ],
            scripts: [],
            configurations: {
                development: {
                    mode: 'development',
                },
                production: {
                    mode: 'production',
                    optimization: true,
                    sourceMap: false,
                    outputHashing: 'all',
                    namedChunks: false,
                    extractLicenses: true,
                    vendorChunk: false,
                },
            },
        },
    };
}
function createRspackServeTarget(options) {
    return {
        executor: '@nx/rspack:dev-server',
        defaultConfiguration: 'development',
        options: {
            buildTarget: `${options.projectName}:build`,
            hmr: true,
        },
        configurations: {
            development: {
                buildTarget: `${options.projectName}:build:development`,
            },
            production: {
                buildTarget: `${options.projectName}:build:production`,
                hmr: false,
            },
        },
    };
}
function createBuildTarget(options) {
    return {
        executor: '@nx/webpack:webpack',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
            compiler: options.compiler ?? 'babel',
            outputPath: options.isUsingTsSolutionConfig
                ? (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'dist')
                : (0, devkit_1.joinPathFragments)('dist', options.appProjectRoot !== '.'
                    ? options.appProjectRoot
                    : options.projectName),
            index: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/index.html'),
            baseHref: '/',
            main: (0, devkit_1.joinPathFragments)(options.appProjectRoot, (0, maybe_js_1.maybeJs)(options, `src/main.tsx`)),
            tsConfig: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.app.json'),
            assets: [
                (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/favicon.ico'),
                (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'src/assets'),
            ],
            styles: options.styledModule || !options.hasStyles
                ? []
                : [
                    (0, devkit_1.joinPathFragments)(options.appProjectRoot, `src/styles.${options.style === 'tailwind' ? 'css' : options.style}`),
                ],
            scripts: [],
            webpackConfig: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'webpack.config.js'),
        },
        configurations: {
            development: {
                extractLicenses: false,
                optimization: false,
                sourceMap: true,
                vendorChunk: true,
            },
            production: {
                fileReplacements: [
                    {
                        replace: (0, devkit_1.joinPathFragments)(options.appProjectRoot, (0, maybe_js_1.maybeJs)(options, `src/environments/environment.ts`)),
                        with: (0, devkit_1.joinPathFragments)(options.appProjectRoot, (0, maybe_js_1.maybeJs)(options, `src/environments/environment.prod.ts`)),
                    },
                ],
                optimization: true,
                outputHashing: 'all',
                sourceMap: false,
                namedChunks: false,
                extractLicenses: true,
                vendorChunk: false,
            },
        },
    };
}
function createServeTarget(options) {
    return {
        executor: '@nx/webpack:dev-server',
        defaultConfiguration: 'development',
        options: {
            buildTarget: `${options.projectName}:build`,
            hmr: true,
        },
        configurations: {
            development: {
                buildTarget: `${options.projectName}:build:development`,
            },
            production: {
                buildTarget: `${options.projectName}:build:production`,
                hmr: false,
            },
        },
    };
}
