"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRspack = initRspack;
exports.handleStyledJsxForRspack = handleStyledJsxForRspack;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const pc = tslib_1.__importStar(require("picocolors"));
const versions_1 = require("../../../../utils/versions");
async function initRspack(tree, options, tasks) {
    const { rspackInitGenerator } = (0, devkit_1.ensurePackage)('@nx/rspack', versions_1.nxVersion);
    const rspackInitTask = await rspackInitGenerator(tree, {
        ...options,
        skipFormat: true,
    });
    tasks.push(rspackInitTask);
}
function handleStyledJsxForRspack(tasks, tree, options) {
    devkit_1.logger.warn(`${pc.bold('styled-jsx')} is not supported by ${pc.bold('Rspack')}. We've added ${pc.bold('babel-loader')} to your project, but using babel will slow down your build.`);
    tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {}, { 'babel-loader': versions_1.babelLoaderVersion }));
    tree.write((0, devkit_1.joinPathFragments)(options.appProjectRoot, 'rspack.config.js'), (0, devkit_1.stripIndents) `
        const { composePlugins, withNx, withReact } = require('@nx/rspack');
        module.exports = composePlugins(withNx(), withReact(), (config) => {
          config.module.rules.push({
            test: /\\.[jt]sx$/i,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-typescript'],
                  plugins: ['styled-jsx/babel'],
                },
              },
            ],
          });
          return config;
        });
        `);
}
