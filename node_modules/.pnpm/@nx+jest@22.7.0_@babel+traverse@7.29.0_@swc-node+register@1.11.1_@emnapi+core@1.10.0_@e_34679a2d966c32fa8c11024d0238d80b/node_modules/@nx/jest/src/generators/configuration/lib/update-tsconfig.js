"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTsConfig = updateTsConfig;
const devkit_1 = require("@nx/devkit");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
function updateTsConfig(host, options) {
    const { root, projectType: _projectType } = (0, devkit_1.readProjectConfiguration)(host, options.project);
    if (!host.exists((0, devkit_1.joinPathFragments)(root, 'tsconfig.json'))) {
        throw new Error(`Expected ${(0, devkit_1.joinPathFragments)(root, 'tsconfig.json')} to exist. Please create one.`);
    }
    (0, devkit_1.updateJson)(host, (0, devkit_1.joinPathFragments)(root, 'tsconfig.json'), (json) => {
        if (json.references &&
            !json.references.some((r) => r.path === './tsconfig.spec.json')) {
            json.references.push({
                path: './tsconfig.spec.json',
            });
        }
        // If compilerOptions.types is defined, ensure "node" is included to support
        // module.exports syntax in jest.config.cts. If types is not defined,
        // TypeScript automatically loads @types/node.
        if (json.compilerOptions?.types) {
            if (!json.compilerOptions.types.includes('node')) {
                json.compilerOptions.types.push('node');
            }
        }
        return json;
    });
    const projectType = (0, ts_solution_setup_1.getProjectType)(host, root, _projectType);
    // fall-back runtime tsconfig file path in case the user didn't provide one
    let runtimeTsconfigPath = (0, devkit_1.joinPathFragments)(root, projectType === 'application' ? 'tsconfig.app.json' : 'tsconfig.lib.json');
    if (options.runtimeTsconfigFileName) {
        runtimeTsconfigPath = (0, devkit_1.joinPathFragments)(root, options.runtimeTsconfigFileName);
        // If the app is Next.js it will not have a tsconfig.app.json
        const extensions = ['js', 'ts', 'mjs', 'cjs'];
        const hasNextConfig = extensions.some((ext) => host.exists((0, devkit_1.joinPathFragments)(root, `next.config.${ext}`)));
        if (hasNextConfig && projectType === 'application') {
            runtimeTsconfigPath = (0, devkit_1.joinPathFragments)(root, 'tsconfig.json');
        }
        if (!host.exists(runtimeTsconfigPath)) {
            // the user provided a runtimeTsconfigFileName that doesn't exist, so we throw an error
            throw new Error(`Cannot find the provided runtimeTsConfigFileName ("${options.runtimeTsconfigFileName}") at the project root "${root}".`);
        }
    }
    if (host.exists(runtimeTsconfigPath)) {
        (0, devkit_1.updateJson)(host, runtimeTsconfigPath, (json) => {
            const uniqueExclude = new Set([
                ...(json.exclude || []),
                ...(options.js
                    ? ['jest.config.js']
                    : ['jest.config.ts', 'jest.config.cts']),
                'src/**/*.spec.ts',
                'src/**/*.test.ts',
                ...(options.js ? ['src/**/*.spec.js', 'src/**/*.test.js'] : []),
            ]);
            json.exclude = [...uniqueExclude];
            return json;
        });
    }
    else {
        devkit_1.logger.warn(`Couldn't find a runtime tsconfig file at ${runtimeTsconfigPath} to exclude the test files from. ` +
            `If you're using a different filename for your runtime tsconfig, please provide it with the '--runtimeTsconfigFileName' flag.`);
    }
}
