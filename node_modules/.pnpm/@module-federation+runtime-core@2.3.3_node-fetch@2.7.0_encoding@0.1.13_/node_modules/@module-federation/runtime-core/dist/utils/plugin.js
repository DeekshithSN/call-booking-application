import { getGlobalHostPlugins } from "../global.js";

//#region src/utils/plugin.ts
function registerPlugins(plugins, instance) {
	const globalPlugins = getGlobalHostPlugins();
	const hookInstances = [
		instance.hooks,
		instance.remoteHandler.hooks,
		instance.sharedHandler.hooks,
		instance.snapshotHandler.hooks,
		instance.loaderHook,
		instance.bridgeHook
	];
	if (globalPlugins.length > 0) globalPlugins.forEach((plugin) => {
		if (plugins?.find((item) => item.name !== plugin.name)) plugins.push(plugin);
	});
	if (plugins && plugins.length > 0) plugins.forEach((plugin) => {
		hookInstances.forEach((hookInstance) => {
			hookInstance.applyPlugin(plugin, instance);
		});
	});
	return plugins;
}

//#endregion
export { registerPlugins };
//# sourceMappingURL=plugin.js.map