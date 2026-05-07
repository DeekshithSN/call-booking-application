"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPluginRegistrations = addPluginRegistrations;
const devkit_1 = require("@nx/devkit");
const picomatch = require("picomatch");
async function addPluginRegistrations(tree, projectTargets, projects, pluginPath) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    for (const [project, options] of projectTargets.entries()) {
        const existingPlugin = nxJson.plugins?.find((plugin) => typeof plugin !== 'string' &&
            plugin.plugin === pluginPath &&
            Object.keys(options).every((key) => plugin.options[key] === options[key]));
        const projectIncludeGlob = `${projects.get(project).root}/**/*`;
        if (!existingPlugin) {
            nxJson.plugins ??= [];
            const plugin = {
                plugin: pluginPath,
                options,
                include: [projectIncludeGlob],
            };
            nxJson.plugins.push(plugin);
        }
        else if (existingPlugin.include) {
            if (!existingPlugin.include.some((include) => picomatch(include)(projectIncludeGlob))) {
                existingPlugin.include.push(projectIncludeGlob);
            }
        }
    }
    if (!areProjectsUsingTheExecutorLeft(projects)) {
        // all projects have been migrated, if there's only one plugin registration
        // left, remove its "include" property
        const pluginRegistrations = nxJson.plugins?.filter((plugin) => typeof plugin !== 'string' && plugin.plugin === pluginPath);
        if (pluginRegistrations?.length === 1) {
            for (const plugin of pluginRegistrations) {
                delete plugin.include;
            }
        }
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
}
function areProjectsUsingTheExecutorLeft(projects) {
    return Array.from(projects.values()).some((project) => Object.values(project.targets ?? {}).some((target) => target.executor === '@nx/rollup:rollup'));
}
