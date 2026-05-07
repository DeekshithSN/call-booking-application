const require_Action = require('./Action-CzhPMw2i.js');
const require_utils = require('./utils-7KqCZHbb.js');
let isomorphic_ws = require("isomorphic-ws");
isomorphic_ws = require_Action.__toESM(isomorphic_ws);

//#region src/server/message/Action/FetchTypes.ts
var FetchTypesAction = class extends require_Action.Action {
	constructor(payload) {
		super({ payload }, require_Action.ActionKind.FETCH_TYPES);
	}
};

//#endregion
//#region src/server/message/Action/AddDynamicRemote.ts
var AddDynamicRemoteAction = class extends require_Action.Action {
	constructor(payload) {
		super({ payload }, require_Action.ActionKind.ADD_DYNAMIC_REMOTE);
	}
};

//#endregion
//#region src/server/createWebsocket.ts
function createWebsocket() {
	return new isomorphic_ws.default(`ws://127.0.0.1:${require_Action.DEFAULT_WEB_SOCKET_PORT}?WEB_SOCKET_CONNECT_MAGIC_ID=${require_Action.WEB_SOCKET_CONNECT_MAGIC_ID}`);
}

//#endregion
//#region src/runtime-plugins/dynamic-remote-type-hints-plugin.ts
const PLUGIN_NAME = "dynamic-remote-type-hints-plugin";
function dynamicRemoteTypeHintsPlugin() {
	let ws = createWebsocket();
	let isConnected = false;
	ws.onopen = () => {
		isConnected = true;
	};
	ws.onerror = (err) => {
		console.error(`[ ${PLUGIN_NAME} ] err: ${err}`);
	};
	return {
		name: "dynamic-remote-type-hints-plugin",
		registerRemote(args) {
			const { remote, origin } = args;
			try {
				if (!isConnected) return args;
				if (!("entry" in remote)) return args;
				const defaultIpV4 = typeof FEDERATION_IPV4 === "string" ? FEDERATION_IPV4 : "127.0.0.1";
				const remoteIp = require_utils.getIpFromEntry(remote.entry, defaultIpV4);
				const remoteInfo = {
					name: remote.name,
					url: remote.entry,
					alias: remote.alias || remote.name
				};
				if (remoteIp) ws.send(JSON.stringify(new AddDynamicRemoteAction({
					remoteIp,
					remoteInfo,
					name: origin.name,
					ip: defaultIpV4
				})));
				ws.send(JSON.stringify(new FetchTypesAction({
					name: origin.name,
					ip: defaultIpV4,
					remoteInfo
				})));
				return args;
			} catch (err) {
				console.error(new Error(err));
				return args;
			}
		}
	};
}

//#endregion
module.exports = dynamicRemoteTypeHintsPlugin;