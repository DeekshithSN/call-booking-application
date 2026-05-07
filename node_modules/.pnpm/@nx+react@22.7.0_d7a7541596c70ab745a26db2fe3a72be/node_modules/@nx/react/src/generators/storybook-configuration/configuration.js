"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storybookConfigurationGenerator = storybookConfigurationGenerator;
exports.storybookConfigurationGeneratorInternal = storybookConfigurationGeneratorInternal;
const devkit_1 = require("@nx/devkit");
const framework_1 = require("../../utils/framework");
const versions_1 = require("../../utils/versions");
const stories_1 = require("../stories/stories");
function storybookConfigurationGenerator(host, schema) {
    return storybookConfigurationGeneratorInternal(host, {
        addPlugin: false,
        ...schema,
    });
}
async function storybookConfigurationGeneratorInternal(host, schema) {
    const tasks = [];
    const nxJson = (0, devkit_1.readNxJson)(host);
    const addPluginDefault = process.env.NX_ADD_PLUGINS !== 'false' &&
        nxJson.useInferencePlugins !== false;
    schema.addPlugin ??= addPluginDefault;
    const { configurationGenerator } = (0, devkit_1.ensurePackage)('@nx/storybook', versions_1.nxVersion);
    const uiFramework = (0, framework_1.getUiFramework)(host, schema.project);
    if (uiFramework === '@storybook/react-vite') {
        tasks.push((0, devkit_1.addDependenciesToPackageJson)(host, {}, { '@vitejs/plugin-react': versions_1.reactViteVersion }));
    }
    const installTask = await configurationGenerator(host, {
        project: schema.project,
        js: schema.js,
        linter: schema.linter,
        tsConfiguration: schema.tsConfiguration ?? true, // default is true
        interactionTests: schema.interactionTests ?? true, // default is true
        configureStaticServe: schema.configureStaticServe,
        uiFramework: uiFramework, // cannot import UiFramework type dynamically
        skipFormat: true,
        addPlugin: schema.addPlugin,
    });
    tasks.push(installTask);
    if (schema.generateStories) {
        await (0, stories_1.storiesGenerator)(host, {
            project: schema.project,
            js: schema.js,
            ignorePaths: schema.ignorePaths,
            skipFormat: true,
            interactionTests: schema.interactionTests ?? true,
            uiFramework,
        });
    }
    await (0, devkit_1.formatFiles)(host);
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = storybookConfigurationGenerator;
