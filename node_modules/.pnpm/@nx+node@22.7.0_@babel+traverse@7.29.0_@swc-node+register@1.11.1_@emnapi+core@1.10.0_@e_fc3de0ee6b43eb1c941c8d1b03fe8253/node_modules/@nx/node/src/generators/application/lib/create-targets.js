"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebpackBuildConfig = getWebpackBuildConfig;
exports.getEsBuildConfig = getEsBuildConfig;
exports.getServeConfig = getServeConfig;
exports.getNestWebpackBuildConfig = getNestWebpackBuildConfig;
exports.getPruneTargets = getPruneTargets;
const devkit_1 = require("@nx/devkit");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const js_1 = require("@nx/js");
function getWebpackBuildConfig(tree, project, options) {
    const sourceRoot = (0, ts_solution_setup_1.getProjectSourceRoot)(project, tree);
    return {
        executor: `@nx/webpack:webpack`,
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
            target: 'node',
            compiler: 'tsc',
            outputPath: options.outputPath,
            main: (0, devkit_1.joinPathFragments)(sourceRoot, 'main' + (options.js ? '.js' : '.ts')),
            tsConfig: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.app.json'),
            assets: [(0, devkit_1.joinPathFragments)(sourceRoot, 'assets')],
            webpackConfig: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'webpack.config.js'),
            generatePackageJson: options.isUsingTsSolutionConfig ? undefined : true,
        },
        configurations: {
            development: {
                outputHashing: 'none',
            },
            production: {
                ...(options.docker && { generateLockfile: true }),
            },
        },
    };
}
function getEsBuildConfig(tree, project, options) {
    const sourceRoot = (0, ts_solution_setup_1.getProjectSourceRoot)(project, tree);
    return {
        executor: '@nx/esbuild:esbuild',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
            platform: 'node',
            outputPath: options.outputPath,
            // Use CJS for Node apps for widest compatibility.
            format: ['cjs'],
            bundle: false,
            main: (0, devkit_1.joinPathFragments)(sourceRoot, 'main' + (options.js ? '.js' : '.ts')),
            tsConfig: (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.app.json'),
            assets: [(0, devkit_1.joinPathFragments)(sourceRoot, 'assets')],
            generatePackageJson: options.isUsingTsSolutionConfig ? undefined : true,
            esbuildOptions: {
                sourcemap: true,
                // Generate CJS files as .js so imports can be './foo' rather than './foo.cjs'.
                outExtension: { '.js': '.js' },
            },
        },
        configurations: {
            development: {},
            production: {
                ...(options.docker && { generateLockfile: true }),
                esbuildOptions: {
                    sourcemap: false,
                    // Generate CJS files as .js so imports can be './foo' rather than './foo.cjs'.
                    outExtension: { '.js': '.js' },
                },
            },
        },
    };
}
function getServeConfig(options) {
    return {
        continuous: true,
        executor: '@nx/js:node',
        defaultConfiguration: 'development',
        // Run build, which includes dependency on "^build" by default, so the first run
        // won't error out due to missing build artifacts.
        dependsOn: ['build'],
        options: {
            buildTarget: `${options.name}:build`,
            // Even though `false` is the default, set this option so users know it
            // exists if they want to always run dependencies during each rebuild.
            runBuildTargetDependencies: false,
        },
        configurations: {
            development: {
                buildTarget: `${options.name}:build:development`,
            },
            production: {
                buildTarget: `${options.name}:build:production`,
            },
        },
    };
}
function getNestWebpackBuildConfig(project) {
    return {
        executor: 'nx:run-commands',
        options: {
            command: 'webpack-cli build',
            args: ['--node-env=production'],
            cwd: project.root,
        },
        configurations: {
            development: {
                args: ['--node-env=development'],
            },
        },
    };
}
function getPruneTargets(buildTarget, outputPath) {
    const lockFileName = (0, js_1.getLockFileName)((0, devkit_1.detectPackageManager)() ?? 'npm') ?? 'package-lock.json';
    return {
        'prune-lockfile': {
            dependsOn: ['build'],
            cache: true,
            executor: '@nx/js:prune-lockfile',
            outputs: [
                `{workspaceRoot}/${(0, devkit_1.joinPathFragments)(outputPath, 'package.json')}`,
                `{workspaceRoot}/${(0, devkit_1.joinPathFragments)(outputPath, lockFileName)}`,
            ],
            options: {
                buildTarget,
            },
        },
        'copy-workspace-modules': {
            dependsOn: ['build'],
            cache: true,
            outputs: [
                `{workspaceRoot}/${(0, devkit_1.joinPathFragments)(outputPath, 'workspace_modules')}`,
            ],
            executor: '@nx/js:copy-workspace-modules',
            options: {
                buildTarget,
            },
        },
        prune: {
            dependsOn: ['prune-lockfile', 'copy-workspace-modules'],
            executor: 'nx:noop',
        },
    };
}
