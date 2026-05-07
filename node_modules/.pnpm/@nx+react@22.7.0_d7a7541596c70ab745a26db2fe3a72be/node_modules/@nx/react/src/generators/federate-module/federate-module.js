"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.federateModuleGenerator = federateModuleGenerator;
const devkit_1 = require("@nx/devkit");
const remote_1 = require("../remote/remote");
const utils_1 = require("./lib/utils");
const project_name_and_root_utils_1 = require("@nx/devkit/src/generators/project-name-and-root-utils");
const js_1 = require("@nx/js");
async function federateModuleGenerator(tree, schema) {
    // Check if the file exists
    if (!tree.exists(schema.path)) {
        throw new Error((0, devkit_1.stripIndents) `The "path" provided  does not exist. Please verify the path is correct and pointing to a file that exists in the workspace.
    
    Path: ${schema.path}`);
    }
    const tasks = [];
    const { projectName: remoteName, projectRoot: remoteRoot } = await (0, project_name_and_root_utils_1.determineProjectNameAndRootOptions)(tree, {
        name: schema.remote,
        directory: schema.remoteDirectory,
        projectType: 'application',
    });
    // Check remote exists
    const remote = (0, utils_1.checkRemoteExists)(tree, remoteName);
    if (!remote) {
        // create remote
        const remoteGeneratorTask = await (0, remote_1.remoteGenerator)(tree, {
            name: remoteName,
            directory: remoteRoot,
            e2eTestRunner: schema.e2eTestRunner,
            skipFormat: schema.skipFormat,
            linter: schema.linter,
            style: schema.style,
            unitTestRunner: schema.unitTestRunner,
            host: schema.host,
            bundler: schema.bundler ?? 'rspack',
        });
        tasks.push(remoteGeneratorTask);
    }
    // add path to exposes property
    const normalizedModulePath = schema.bundler === 'rspack'
        ? (0, devkit_1.joinPathFragments)((0, devkit_1.offsetFromRoot)(remoteRoot), schema.path)
        : schema.path;
    (0, utils_1.addPathToExposes)(tree, remoteRoot, schema.name, normalizedModulePath);
    // Add new path to tsconfig
    const rootJSON = (0, devkit_1.readJson)(tree, (0, js_1.getRootTsConfigPathInTree)(tree));
    if (!rootJSON?.compilerOptions?.paths[`${remoteName}/${schema.name}`]) {
        (0, js_1.addTsConfigPath)(tree, `${remoteName}/${schema.name}`, [schema.path]);
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    devkit_1.logger.info(`✅️ Updated module federation config.
    Now you can use the module from your host app like this:

    Static import:
    import { MyComponent } from '${remoteName}/${schema.name}';
    
    Dynamic import:
    import('${remoteName}/${schema.name}').then((m) => m.${schema.name});
  `);
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = federateModuleGenerator;
