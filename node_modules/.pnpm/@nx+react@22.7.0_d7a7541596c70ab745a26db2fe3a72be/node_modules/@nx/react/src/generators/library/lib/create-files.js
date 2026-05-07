"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFiles = createFiles;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const create_ts_config_1 = require("../../../utils/create-ts-config");
const path_1 = require("path");
function createFiles(host, options) {
    const relativePathToRootTsConfig = (0, js_1.getRelativePathToRootTsConfig)(host, options.projectRoot);
    const substitutions = {
        ...options,
        ...(0, devkit_1.names)(options.name),
        tmpl: '',
        offsetFromRoot: (0, devkit_1.offsetFromRoot)(options.projectRoot),
        fileName: options.fileName,
    };
    (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, '../files/common'), options.projectRoot, substitutions);
    if (options.bundler === 'vite' || options.unitTestRunner === 'vitest') {
        (0, devkit_1.generateFiles)(host, (0, path_1.join)(__dirname, '../files/vite'), options.projectRoot, substitutions);
    }
    if (options.compiler === 'babel') {
        (0, devkit_1.writeJson)(host, (0, devkit_1.joinPathFragments)(options.projectRoot, '.babelrc'), {
            presets: [
                [
                    '@nx/react/babel',
                    {
                        runtime: 'automatic',
                        useBuiltIns: 'usage',
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
    if ((options.publishable || options.buildable) &&
        !options.isUsingTsSolutionConfig &&
        options.useProjectJson) {
        if (options.bundler === 'vite') {
            (0, devkit_1.writeJson)(host, `${options.projectRoot}/package.json`, {
                name: options.importPath,
                version: '0.0.1',
                main: './index.js',
                types: './index.d.ts',
                exports: {
                    '.': {
                        import: './index.mjs',
                        require: './index.js',
                    },
                },
            });
        }
        else {
            (0, devkit_1.writeJson)(host, `${options.projectRoot}/package.json`, {
                name: options.importPath,
                version: '0.0.1',
            });
        }
    }
    if (options.js) {
        (0, devkit_1.toJS)(host);
    }
    (0, create_ts_config_1.createTsConfig)(host, options.projectRoot, 'lib', options, relativePathToRootTsConfig);
}
