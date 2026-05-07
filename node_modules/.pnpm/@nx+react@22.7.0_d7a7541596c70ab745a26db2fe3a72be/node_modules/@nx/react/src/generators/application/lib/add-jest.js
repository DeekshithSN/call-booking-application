"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJest = addJest;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../../utils/versions");
const node_path_1 = require("node:path");
async function addJest(host, options) {
    if (options.unitTestRunner === 'none') {
        return () => { };
    }
    const { configurationGenerator } = (0, devkit_1.ensurePackage)('@nx/jest', versions_1.nxVersion);
    await configurationGenerator(host, {
        ...options,
        project: options.projectName,
        supportTsx: true,
        skipSerializers: true,
        setupFile: options.useReactRouter ? 'react-router' : 'none',
        compiler: options.compiler,
        skipFormat: true,
        runtimeTsconfigFileName: 'tsconfig.app.json',
    });
    if (options.useReactRouter) {
        (0, devkit_1.updateJson)(host, (0, node_path_1.join)(options.appProjectRoot, 'tsconfig.spec.json'), (json) => {
            json.include = json.include ?? [];
            const reactRouterTestGlob = options.js
                ? [
                    'test/**/*.spec.jsx',
                    'test/**/*.spec.js',
                    'test/**/*.test.jsx',
                    'test/**/*.test.js',
                ]
                : [
                    'test/**/*.spec.tsx',
                    'test/**/*.spec.ts',
                    'test/**/*.test.tsx',
                    'test/**/*.test.ts',
                ];
            return {
                ...json,
                include: Array.from(new Set([...json.include, ...reactRouterTestGlob])),
            };
        });
    }
    return () => { };
}
