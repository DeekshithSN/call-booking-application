"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findExistingJsBuildTargetInProject = findExistingJsBuildTargetInProject;
exports.addOrChangeTestTarget = addOrChangeTestTarget;
exports.addBuildTarget = addBuildTarget;
exports.addServeTarget = addServeTarget;
exports.addPreviewTarget = addPreviewTarget;
exports.editTsConfig = editTsConfig;
exports.deleteWebpackConfig = deleteWebpackConfig;
exports.moveAndEditIndexHtml = moveAndEditIndexHtml;
exports.createOrEditViteConfig = createOrEditViteConfig;
exports.normalizeViteConfigFilePathWithTree = normalizeViteConfigFilePathWithTree;
exports.getViteConfigPathForProject = getViteConfigPathForProject;
exports.handleUnsupportedUserProvidedTargets = handleUnsupportedUserProvidedTargets;
exports.handleUnknownConfiguration = handleUnknownConfiguration;
const devkit_1 = require("@nx/devkit");
const target_defaults_utils_1 = require("@nx/devkit/src/generators/target-defaults-utils");
const ts_solution_setup_1 = require("@nx/js/src/utils/typescript/ts-solution-setup");
const vite_config_edit_utils_1 = require("./vite-config-edit-utils");
function findExistingJsBuildTargetInProject(targets) {
    const output = {};
    const supportedExecutors = {
        build: ['@nx/js:babel', '@nx/js:swc', '@nx/rollup:rollup'],
    };
    const unsupportedExecutors = [
        '@nx/angular:ng-packagr-lite',
        '@nx/angular:package',
        '@nx/angular:webpack-browser',
        '@nx/esbuild:esbuild',
        '@nx/react-native:run-ios',
        '@nx/react-native:start',
        '@nx/react-native:run-android',
        '@nx/react-native:bundle',
        '@nx/react-native:build-android',
        '@nx/react-native:bundle',
        '@nx/next:build',
        '@nx/js:tsc',
        '@nrwl/angular:ng-packagr-lite',
        '@nrwl/angular:package',
        '@nrwl/angular:webpack-browser',
        '@nrwl/esbuild:esbuild',
        '@nrwl/react-native:run-ios',
        '@nrwl/react-native:start',
        '@nrwl/react-native:run-android',
        '@nrwl/react-native:bundle',
        '@nrwl/react-native:build-android',
        '@nrwl/react-native:bundle',
        '@nrwl/next:build',
        '@nrwl/js:tsc',
        '@angular-devkit/build-angular:browser',
        '@angular-devkit/build-angular:browser-esbuild',
        '@angular-devkit/build-angular:application',
    ];
    // We try to find the target that is using the supported executors
    // for build since this is the one we will be converting
    for (const target in targets) {
        const executorName = targets[target].executor;
        if (supportedExecutors.build.includes(executorName)) {
            output.supported = target;
        }
        else if (unsupportedExecutors.includes(executorName)) {
            output.unsupported = target;
        }
    }
    return output;
}
function addOrChangeTestTarget(tree, options, hasPlugin) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    hasPlugin = nxJson.plugins?.some((p) => typeof p === 'string'
        ? p === '@nx/vite/plugin'
        : p.plugin === '@nx/vite/plugin' || hasPlugin);
    if (hasPlugin) {
        return;
    }
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const target = options.testTarget ?? 'test';
    const reportsDirectory = (0, devkit_1.joinPathFragments)((0, devkit_1.offsetFromRoot)(project.root), 'coverage', project.root === '.' ? options.project : project.root);
    const testOptions = {
        reportsDirectory,
    };
    project.targets ??= {};
    if (project.targets[target]) {
        throw new Error(`Target "${target}" already exists in the project.`);
    }
    else {
        project.targets[target] = {
            executor: '@nx/vite:test',
            outputs: ['{options.reportsDirectory}'],
            options: testOptions,
        };
    }
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, project);
}
function addBuildTarget(tree, options, target) {
    (0, target_defaults_utils_1.addBuildTargetDefaults)(tree, '@nx/vite:build');
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const isTsSolutionSetup = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree);
    const buildOptions = {
        outputPath: isTsSolutionSetup
            ? (0, devkit_1.joinPathFragments)(project.root, 'dist')
            : (0, devkit_1.joinPathFragments)('dist', project.root != '.' ? project.root : options.project),
    };
    project.targets ??= {};
    project.targets[target] = {
        executor: '@nx/vite:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: buildOptions,
        configurations: {
            development: {
                mode: 'development',
            },
            production: {
                mode: 'production',
            },
        },
    };
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, project);
}
function addServeTarget(tree, options, target) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    project.targets ??= {};
    project.targets[target] = {
        executor: '@nx/vite:dev-server',
        defaultConfiguration: 'development',
        options: {
            buildTarget: `${options.project}:build`,
        },
        configurations: {
            development: {
                buildTarget: `${options.project}:build:development`,
                hmr: true,
            },
            production: {
                buildTarget: `${options.project}:build:production`,
                hmr: false,
            },
        },
    };
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, project);
}
/**
 * Adds a target for the preview server.
 *
 * @param tree
 * @param options
 * @param serveTarget An existing serve target.
 */
function addPreviewTarget(tree, options, serveTarget) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const previewOptions = {
        buildTarget: `${options.project}:build`,
    };
    project.targets ??= {};
    // Update the options from the passed serve target.
    if (project.targets[serveTarget]) {
        const target = project.targets[serveTarget];
        if (target.executor === '@nxext/vite:dev') {
            previewOptions.proxyConfig = target.options.proxyConfig;
        }
        previewOptions['https'] = target.options?.https;
        previewOptions['open'] = target.options?.open;
    }
    // Adds a preview target.
    project.targets.preview = {
        dependsOn: ['build'],
        executor: '@nx/vite:preview-server',
        defaultConfiguration: 'development',
        options: previewOptions,
        configurations: {
            development: {
                buildTarget: `${options.project}:build:development`,
            },
            production: {
                buildTarget: `${options.project}:build:production`,
            },
        },
    };
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, project);
}
function editTsConfig(tree, options) {
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    let tsconfigPath = (0, devkit_1.joinPathFragments)(projectConfig.root, 'tsconfig.json');
    const isTsSolutionSetup = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree);
    if (isTsSolutionSetup) {
        tsconfigPath = [
            (0, devkit_1.joinPathFragments)(projectConfig.root, 'tsconfig.app.json'),
            (0, devkit_1.joinPathFragments)(projectConfig.root, 'tsconfig.lib.json'),
        ].find((p) => tree.exists(p));
    }
    const config = (0, devkit_1.readJson)(tree, tsconfigPath);
    switch (options.uiFramework) {
        case 'react':
            config.compilerOptions = {
                jsx: 'react-jsx',
                allowJs: false,
                esModuleInterop: false,
                allowSyntheticDefaultImports: true,
                strict: true,
            };
            break;
        case 'none':
            if (!isTsSolutionSetup) {
                config.compilerOptions = {
                    module: 'commonjs',
                    forceConsistentCasingInFileNames: true,
                    strict: true,
                    noImplicitOverride: true,
                    noPropertyAccessFromIndexSignature: true,
                    noImplicitReturns: true,
                    noFallthroughCasesInSwitch: true,
                };
            }
            break;
        default:
            break;
    }
    (0, devkit_1.writeJson)(tree, tsconfigPath, config);
}
function deleteWebpackConfig(tree, projectRoot, webpackConfigFilePath) {
    const webpackConfigPath = webpackConfigFilePath && tree.exists(webpackConfigFilePath)
        ? webpackConfigFilePath
        : tree.exists(`${projectRoot}/webpack.config.js`)
            ? `${projectRoot}/webpack.config.js`
            : tree.exists(`${projectRoot}/webpack.config.ts`)
                ? `${projectRoot}/webpack.config.ts`
                : null;
    if (webpackConfigPath) {
        tree.delete(webpackConfigPath);
    }
}
function moveAndEditIndexHtml(tree, options) {
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    let indexHtmlPath = `${projectConfig.root}/src/index.html`;
    let mainPath = `${projectConfig.root}/src/main.ts${options.uiFramework === 'react' ? 'x' : ''}`;
    if (projectConfig.root !== '.') {
        mainPath = mainPath.replace(projectConfig.root, '');
    }
    if (!tree.exists(indexHtmlPath) &&
        tree.exists(`${projectConfig.root}/index.html`)) {
        indexHtmlPath = `${projectConfig.root}/index.html`;
    }
    if (tree.exists(indexHtmlPath)) {
        const indexHtmlContent = tree.read(indexHtmlPath, 'utf8');
        if (!indexHtmlContent.includes(`<script type='module' src='${mainPath}'></script>`)) {
            tree.write(`${projectConfig.root}/index.html`, indexHtmlContent.replace('</body>', `<script type='module' src='${mainPath}'></script>
          </body>`));
            if (tree.exists(`${projectConfig.root}/src/index.html`)) {
                tree.delete(`${projectConfig.root}/src/index.html`);
            }
        }
    }
    else {
        tree.write(`${projectConfig.root}/index.html`, `<!DOCTYPE html>
      <html lang='en'>
        <head>
          <meta charset='UTF-8' />
          <link rel='icon' href='/favicon.ico' />
          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
          <title>Vite</title>
        </head>
        <body>
          <div id='root'></div>
          <script type='module' src='${mainPath}'></script>
        </body>
      </html>`);
    }
}
function createOrEditViteConfig(tree, options, onlyVitest, projectAlreadyHasViteTargets, vitestFileName) {
    const { root: projectRoot } = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const extension = options.useEsmExtension ? 'mts' : 'ts';
    const viteConfigPath = vitestFileName
        ? `${projectRoot}/vitest.config.${extension}`
        : `${projectRoot}/vite.config.${extension}`;
    const isTsSolutionSetup = (0, ts_solution_setup_1.isUsingTsSolutionSetup)(tree);
    const buildOutDir = isTsSolutionSetup
        ? './dist'
        : projectRoot === '.'
            ? `./dist/${options.project}`
            : `${(0, devkit_1.offsetFromRoot)(projectRoot)}dist/${projectRoot}`;
    const buildOption = onlyVitest
        ? ''
        : options.includeLib
            ? `  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  build: {
    outDir: '${buildOutDir}',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: '${options.project}',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es' as const]
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [${options.rollupOptionsExternal ?? ''}]
    },
  },`
            : `  build: {
    outDir: '${buildOutDir}',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },`;
    const imports = options.imports ? [...options.imports] : [];
    const plugins = options.plugins ? [...options.plugins] : [];
    if (!onlyVitest && options.includeLib) {
        imports.push(`import dts from 'vite-plugin-dts'`, `import * as path from 'path'`);
    }
    if (!isTsSolutionSetup) {
        imports.push(`import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'`, `import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin'`);
        plugins.push(`nxViteTsPaths()`, `nxCopyAssetsPlugin(['*.md'])`);
    }
    if (!onlyVitest && options.includeLib) {
        plugins.push(`dts({ entryRoot: 'src', tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json')${!isTsSolutionSetup ? ', pathsToAliases: false' : ''} })`);
    }
    const reportsDirectory = isTsSolutionSetup
        ? './test-output/vitest/coverage'
        : projectRoot === '.'
            ? `./coverage/${options.project}`
            : `${(0, devkit_1.offsetFromRoot)(projectRoot)}coverage/${projectRoot}`;
    const testOption = options.includeVitest
        ? `  test: {
    name: '${options.project}',
    watch: false,
    globals: true,
    environment: '${options.testEnvironment ?? 'jsdom'}',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
${options.setupFile ? `    setupFiles: ['${options.setupFile}'],\n` : ''}\
${options.inSourceTests
            ? `    includeSource: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],\n`
            : ''}\
    reporters: ['default'],
    coverage: {
      reportsDirectory: '${reportsDirectory}',
      provider: ${options.coverageProvider
            ? `'${options.coverageProvider}' as const`
            : `'v8' as const`},
    }
  },`
        : '';
    const defineOption = options.inSourceTests
        ? `  define: {
    'import.meta.vitest': undefined
  },`
        : '';
    const devServerOption = onlyVitest
        ? ''
        : options.includeLib
            ? ''
            : `  server:{
    port: ${options.port ?? 4200},
    host: 'localhost',
  },`;
    const previewServerOption = onlyVitest
        ? ''
        : options.includeLib
            ? ''
            : `  preview:{
    port: ${options.previewPort ?? 4300},
    host: 'localhost',
  },`;
    const workerOption = isTsSolutionSetup
        ? `  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },`
        : `  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },`;
    const cacheDir = `cacheDir: '${normalizedJoinPaths((0, devkit_1.offsetFromRoot)(projectRoot), 'node_modules', '.vite', projectRoot === '.' ? options.project : projectRoot)}',`;
    if (tree.exists(viteConfigPath)) {
        handleViteConfigFileExists(tree, viteConfigPath, options, buildOption, buildOutDir, imports, plugins, testOption, reportsDirectory, cacheDir, projectRoot, (0, devkit_1.offsetFromRoot)(projectRoot), projectAlreadyHasViteTargets);
        return;
    }
    const viteConfigContent = `/// <reference types='vitest' />
import { defineConfig } from 'vite';
${imports.join(';\n')}${imports.length ? ';' : ''}

export default defineConfig(() => ({
  root: import.meta.dirname,
  ${printOptions(cacheDir, devServerOption, previewServerOption, `  plugins: [${plugins.join(', ')}],`, workerOption, buildOption, defineOption, testOption)}
}));
`.replace(/\s+(?=(\n|$))/gm, '\n');
    tree.write(viteConfigPath, viteConfigContent);
}
function printOptions(...options) {
    return options.filter(Boolean).join('\n');
}
function normalizeViteConfigFilePathWithTree(tree, projectRoot, configFile) {
    return configFile && tree.exists(configFile)
        ? configFile
        : tree.exists((0, devkit_1.joinPathFragments)(`${projectRoot}/vite.config.mts`))
            ? (0, devkit_1.joinPathFragments)(`${projectRoot}/vite.config.mts`)
            : tree.exists((0, devkit_1.joinPathFragments)(`${projectRoot}/vite.config.ts`))
                ? (0, devkit_1.joinPathFragments)(`${projectRoot}/vite.config.ts`)
                : tree.exists((0, devkit_1.joinPathFragments)(`${projectRoot}/vite.config.js`))
                    ? (0, devkit_1.joinPathFragments)(`${projectRoot}/vite.config.js`)
                    : undefined;
}
function getViteConfigPathForProject(tree, projectName, target) {
    let viteConfigPath;
    const { targets, root } = (0, devkit_1.readProjectConfiguration)(tree, projectName);
    if (target) {
        viteConfigPath = targets?.[target]?.options?.configFile;
    }
    else {
        const config = Object.values(targets).find((config) => config.executor === '@nrwl/nx:build' ||
            config.executor === '@nrwl/vite:build');
        viteConfigPath = config?.options?.configFile;
    }
    return normalizeViteConfigFilePathWithTree(tree, root, viteConfigPath);
}
async function handleUnsupportedUserProvidedTargets(userProvidedTargetIsUnsupported, userProvidedTargetName, validFoundTargetName) {
    if (userProvidedTargetIsUnsupported.build && validFoundTargetName.build) {
        await handleUnsupportedUserProvidedTargetsErrors(userProvidedTargetName.build, validFoundTargetName.build, 'build', 'build');
    }
    if (userProvidedTargetIsUnsupported.serve && validFoundTargetName.serve) {
        await handleUnsupportedUserProvidedTargetsErrors(userProvidedTargetName.serve, validFoundTargetName.serve, 'serve', 'dev-server');
    }
    if (userProvidedTargetIsUnsupported.test && validFoundTargetName.test) {
        await handleUnsupportedUserProvidedTargetsErrors(userProvidedTargetName.test, validFoundTargetName.test, 'test', 'test');
    }
}
async function handleUnsupportedUserProvidedTargetsErrors(userProvidedTargetName, validFoundTargetName, target, executor) {
    devkit_1.logger.warn(`The custom ${target} target you provided (${userProvidedTargetName}) cannot be converted to use the @nx/vite:${executor} executor.
     However, we found the following ${target} target in your project that can be converted: ${validFoundTargetName}

     Please note that converting a potentially non-compatible project to use Vite may result in unexpected behavior. Always commit
     your changes before converting a project to use Vite, and test the converted project thoroughly before deploying it.
    `);
    const { Confirm } = require('enquirer');
    const prompt = new Confirm({
        name: 'question',
        message: `Should we convert the ${validFoundTargetName} target to use the @nx/vite:${executor} executor?`,
        initial: true,
    });
    const shouldConvert = await prompt.run();
    if (!shouldConvert) {
        throw new Error(`The ${target} target ${userProvidedTargetName} cannot be converted to use the @nx/vite:${executor} executor.
      Please try again, either by providing a different ${target} target or by not providing a target at all (Nx will
        convert the first one it finds, most probably this one: ${validFoundTargetName})

      Please note that converting a potentially non-compatible project to use Vite may result in unexpected behavior. Always commit
      your changes before converting a project to use Vite, and test the converted project thoroughly before deploying it.
      `);
    }
}
async function handleUnknownConfiguration(projectName) {
    if (process.env.NX_INTERACTIVE === 'false') {
        return;
    }
    devkit_1.logger.warn(`
      We could not find any configuration in project ${projectName} that 
      indicates whether we can definitely convert to Vite.
      
      If you still want to convert your project to use Vite,
      please make sure to commit your changes before running this generator.
      `);
    const { Confirm } = require('enquirer');
    const prompt = new Confirm({
        name: 'question',
        message: `Should Nx convert your project to use Vite?`,
        initial: true,
    });
    const shouldConvert = await prompt.run();
    if (!shouldConvert) {
        throw new Error(`
      Nx could not verify that your project can be converted to use Vite.
      Please try again with a different project.
    `);
    }
}
function handleViteConfigFileExists(tree, viteConfigPath, options, buildOption, buildOutDir, imports, plugins, testOption, reportsDirectory, cacheDir, projectRoot, offsetFromRoot, projectAlreadyHasViteTargets) {
    if (projectAlreadyHasViteTargets?.build &&
        projectAlreadyHasViteTargets?.test) {
        return;
    }
    if (process.env.NX_VERBOSE_LOGGING === 'true') {
        devkit_1.logger.info(`vite.config.ts already exists for project ${options.project}.`);
    }
    const buildOptionObject = options.includeLib
        ? {
            lib: {
                entry: 'src/index.ts',
                name: options.project,
                fileName: 'index',
                formats: ['es'],
            },
            rollupOptions: {
                external: options.rollupOptionsExternal ?? [],
            },
            outDir: buildOutDir,
            reportCompressedSize: true,
            commonjsOptions: {
                transformMixedEsModules: true,
            },
        }
        : {
            outDir: buildOutDir,
            reportCompressedSize: true,
            commonjsOptions: {
                transformMixedEsModules: true,
            },
        };
    const testOptionObject = {
        globals: true,
        environment: options.testEnvironment ?? 'jsdom',
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        reporters: ['default'],
        coverage: {
            reportsDirectory: reportsDirectory,
            provider: `'${options.coverageProvider ?? 'v8'}'`,
        },
    };
    const changed = (0, vite_config_edit_utils_1.ensureViteConfigIsCorrect)(tree, viteConfigPath, buildOption, buildOptionObject, imports, plugins, testOption, testOptionObject, cacheDir, projectAlreadyHasViteTargets ?? {});
    if (!changed) {
        devkit_1.logger.warn(`Make sure the following setting exists in your Vite configuration file (${viteConfigPath}):
        
        ${buildOption}
        
        `);
    }
}
function normalizedJoinPaths(...paths) {
    const path = (0, devkit_1.joinPathFragments)(...paths);
    return path.startsWith('.') ? path : `./${path}`;
}
