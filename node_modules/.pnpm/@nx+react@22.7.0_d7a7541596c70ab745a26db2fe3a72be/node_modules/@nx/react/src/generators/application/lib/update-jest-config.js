"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSpecConfig = updateSpecConfig;
const jest_utils_1 = require("../../../utils/jest-utils");
const devkit_1 = require("@nx/devkit");
function updateSpecConfig(host, options) {
    if (options.unitTestRunner === 'none') {
        return;
    }
    (0, devkit_1.updateJson)(host, `${options.appProjectRoot}/tsconfig.spec.json`, (json) => {
        const compilerOptions = json.compilerOptions ?? {};
        const types = compilerOptions.types ?? [];
        if (options.style === 'styled-jsx') {
            types.push('@nx/react/typings/styled-jsx.d.ts');
        }
        types.push('@nx/react/typings/cssmodule.d.ts', '@nx/react/typings/image.d.ts');
        compilerOptions.types = types;
        json.compilerOptions = compilerOptions;
        if (options.isUsingTsSolutionConfig) {
            // add project reference to the runtime tsconfig.app.json file
            json.references ??= [];
            json.references.push({ path: './tsconfig.app.json' });
        }
        return json;
    });
    if (options.unitTestRunner !== 'jest') {
        return;
    }
    const configPath = (0, jest_utils_1.findProjectJestConfig)(host, options.appProjectRoot);
    if (!configPath) {
        return;
    }
    const originalContent = host.read(configPath, 'utf-8');
    const content = (0, jest_utils_1.updateJestConfigContent)(originalContent);
    host.write(configPath, content);
}
