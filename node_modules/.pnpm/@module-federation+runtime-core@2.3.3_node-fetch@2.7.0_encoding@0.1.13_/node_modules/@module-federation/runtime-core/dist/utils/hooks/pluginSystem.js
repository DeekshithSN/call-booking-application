import { assert } from "../logger.js";
import { isPlainObject } from "../tool.js";
import "../index.js";

//#region src/utils/hooks/pluginSystem.ts
var PluginSystem = class {
	constructor(lifecycle) {
		this.registerPlugins = {};
		this.lifecycle = lifecycle;
		this.lifecycleKeys = Object.keys(lifecycle);
	}
	applyPlugin(plugin, instance) {
		assert(isPlainObject(plugin), "Plugin configuration is invalid.");
		const pluginName = plugin.name;
		assert(pluginName, "A name must be provided by the plugin.");
		if (!this.registerPlugins[pluginName]) {
			this.registerPlugins[pluginName] = plugin;
			plugin.apply?.(instance);
			Object.keys(this.lifecycle).forEach((key) => {
				const pluginLife = plugin[key];
				if (pluginLife) this.lifecycle[key].on(pluginLife);
			});
		}
	}
	removePlugin(pluginName) {
		assert(pluginName, "A name is required.");
		const plugin = this.registerPlugins[pluginName];
		assert(plugin, `The plugin "${pluginName}" is not registered.`);
		Object.keys(plugin).forEach((key) => {
			if (key !== "name") this.lifecycle[key].remove(plugin[key]);
		});
	}
};

//#endregion
export { PluginSystem };
//# sourceMappingURL=pluginSystem.js.map