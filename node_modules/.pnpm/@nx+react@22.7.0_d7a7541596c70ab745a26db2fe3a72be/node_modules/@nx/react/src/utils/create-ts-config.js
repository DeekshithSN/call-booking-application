"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTsConfig = createTsConfig;
exports.extractTsConfigBase = extractTsConfigBase;
const tslib_1 = require("tslib");
const shared = tslib_1.__importStar(require("@nx/js/src/utils/typescript/create-ts-config"));
const json_1 = require("nx/src/generators/utils/json");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
function createTsConfig(host, projectRoot, type, options, relativePathToRootTsConfig) {
    if ((0, ts_solution_setup_1.isUsingTsSolutionSetup)(host)) {
        createTsConfigForTsSolution(host, projectRoot, type, options, relativePathToRootTsConfig);
    }
    else {
        createTsConfigForNonTsSolution(host, projectRoot, type, options, relativePathToRootTsConfig);
    }
}
function extractTsConfigBase(host) {
    shared.extractTsConfigBase(host);
    if (host.exists('vite.config.ts')) {
        const vite = host.read('vite.config.ts').toString();
        host.write('vite.config.ts', vite.replace(`projects: []`, `projects: ['tsconfig.base.json']`));
    }
}
function createTsConfigForTsSolution(host, projectRoot, type, options, relativePathToRootTsConfig) {
    const json = {
        files: [],
        include: [],
        references: [
            {
                path: type === 'app' ? './tsconfig.app.json' : './tsconfig.lib.json',
            },
        ],
    };
    // inline tsconfig.base.json into the project
    if (options.rootProject) {
        json.compileOnSave = false;
        json.compilerOptions = {
            ...shared.tsConfigBaseOptions,
            ...json.compilerOptions,
        };
        json.exclude = ['node_modules', 'tmp'];
    }
    else {
        json.extends = relativePathToRootTsConfig;
    }
    (0, json_1.writeJson)(host, `${projectRoot}/tsconfig.json`, json);
    const tsconfigProjectPath = `${projectRoot}/tsconfig.${type}.json`;
    if (host.exists(tsconfigProjectPath)) {
        (0, json_1.updateJson)(host, tsconfigProjectPath, (json) => {
            if (options.bundler === 'vite') {
                json.compilerOptions ??= {};
                const types = new Set(json.compilerOptions.types ?? []);
                types.add('node');
                types.add('vite/client');
                json.compilerOptions.types = Array.from(types);
            }
            if (options.style === '@emotion/styled') {
                json.compilerOptions ??= {};
                json.compilerOptions.jsxImportSource = '@emotion/react';
            }
            return json;
        });
    }
}
function createTsConfigForNonTsSolution(host, projectRoot, type, options, relativePathToRootTsConfig) {
    const json = {
        compilerOptions: {
            jsx: 'react-jsx',
            allowJs: false,
            esModuleInterop: false,
            allowSyntheticDefaultImports: true,
            strict: options.strict,
        },
        files: [],
        include: [],
        references: [
            {
                path: type === 'app' ? './tsconfig.app.json' : './tsconfig.lib.json',
            },
        ],
    };
    if (options.style === '@emotion/styled') {
        json.compilerOptions.jsxImportSource = '@emotion/react';
    }
    if (options.bundler === 'vite') {
        json.compilerOptions.types =
            options.unitTestRunner === 'vitest'
                ? ['vite/client', 'vitest']
                : ['vite/client'];
    }
    // inline tsconfig.base.json into the project
    if (options.rootProject) {
        json.compileOnSave = false;
        json.compilerOptions = {
            ...shared.tsConfigBaseOptions,
            ...json.compilerOptions,
        };
        json.exclude = ['node_modules', 'tmp'];
    }
    else {
        json.extends = relativePathToRootTsConfig;
    }
    (0, json_1.writeJson)(host, `${projectRoot}/tsconfig.json`, json);
    const tsconfigProjectPath = `${projectRoot}/tsconfig.${type}.json`;
    if (options.bundler === 'vite' && host.exists(tsconfigProjectPath)) {
        (0, json_1.updateJson)(host, tsconfigProjectPath, (json) => {
            json.compilerOptions ??= {};
            const types = new Set(json.compilerOptions.types ?? []);
            types.add('node');
            types.add('vite/client');
            json.compilerOptions.types = Array.from(types);
            return json;
        });
    }
}
