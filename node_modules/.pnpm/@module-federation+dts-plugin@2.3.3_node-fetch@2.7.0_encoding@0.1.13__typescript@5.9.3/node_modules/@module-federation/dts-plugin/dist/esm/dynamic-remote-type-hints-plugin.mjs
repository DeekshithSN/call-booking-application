import { c as WEB_SOCKET_CONNECT_MAGIC_ID, i as DEFAULT_WEB_SOCKET_PORT, n as ActionKind, t as Action } from "./Action-DNNg2YDh.mjs";
import { t as getIpFromEntry } from "./utils-CkPvDGOy.mjs";
import WebSocket from "isomorphic-ws";

//#region src/server/message/Action/FetchTypes.ts
var FetchTypesAction = class extends Action {
	constructor(payload) {
		super({ payload }, ActionKind.FETCH_TYPES);
	}
};

//#endregion
//#region src/server/message/Action/AddDynamicRemote.ts
var AddDynamicRemoteAction = class extends Action {
	constructor(payload) {
		super({ payload }, ActionKind.ADD_DYNAMIC_REMOTE);
	}
};

//#endregion
//#region src/server/createWebsocket.ts
function createWebsocket() {
	return new WebSocket(`ws://127.0.0.1:${DEFAULT_WEB_SOCKET_PORT}?WEB_SOCKET_CONNECT_MAGIC_ID=${WEB_SOCKET_CONNECT_MAGIC_ID}`);
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
				const remoteIp = getIpFromEntry(remote.entry, defaultIpV4);
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
export { dynamicRemoteTypeHintsPlugin as default };