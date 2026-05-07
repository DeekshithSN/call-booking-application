(function() {


//#region src/server/constant.ts
	const DEFAULT_WEB_SOCKET_PORT = 16322;
	const WEB_SOCKET_CONNECT_MAGIC_ID = "1hpzW-zo2z-o8io-gfmV1-2cb1d82";

//#endregion
//#region src/server/message/Message.ts
	var Message = class {
		constructor(type, kind) {
			this.type = type;
			this.kind = kind;
			this.time = Date.now();
		}
	};

//#endregion
//#region src/server/message/Action/Action.ts
	let ActionKind = /* @__PURE__ */ function(ActionKind) {
		ActionKind["ADD_SUBSCRIBER"] = "ADD_SUBSCRIBER";
		ActionKind["EXIT_SUBSCRIBER"] = "EXIT_SUBSCRIBER";
		ActionKind["ADD_PUBLISHER"] = "ADD_PUBLISHER";
		ActionKind["UPDATE_PUBLISHER"] = "UPDATE_PUBLISHER";
		ActionKind["NOTIFY_SUBSCRIBER"] = "NOTIFY_SUBSCRIBER";
		ActionKind["EXIT_PUBLISHER"] = "EXIT_PUBLISHER";
		ActionKind["ADD_WEB_CLIENT"] = "ADD_WEB_CLIENT";
		ActionKind["NOTIFY_WEB_CLIENT"] = "NOTIFY_WEB_CLIENT";
		ActionKind["FETCH_TYPES"] = "FETCH_TYPES";
		ActionKind["ADD_DYNAMIC_REMOTE"] = "ADD_DYNAMIC_REMOTE";
		return ActionKind;
	}({});
	var Action = class extends Message {
		constructor(content, kind) {
			super("Action", kind);
			const { payload } = content;
			this.payload = payload;
		}
	};

//#endregion
//#region src/server/message/Action/AddWebClient.ts
	var AddWebClientAction = class extends Action {
		constructor(payload) {
			super({ payload }, ActionKind.ADD_WEB_CLIENT);
		}
	};

//#endregion
//#region src/server/message/API/API.ts
	let APIKind = /* @__PURE__ */ function(APIKind) {
		APIKind["UPDATE_SUBSCRIBER"] = "UPDATE_SUBSCRIBER";
		APIKind["RELOAD_WEB_CLIENT"] = "RELOAD_WEB_CLIENT";
		APIKind["FETCH_TYPES"] = "FETCH_TYPES";
		return APIKind;
	}({});

//#endregion
//#region ../../node_modules/.pnpm/isomorphic-ws@5.0.0_ws@8.18.0/node_modules/isomorphic-ws/browser.js
	var ws = null;
	if (typeof WebSocket !== "undefined") ws = WebSocket;
	else if (typeof MozWebSocket !== "undefined") ws = MozWebSocket;
	else if (typeof global !== "undefined") ws = global.WebSocket || global.MozWebSocket;
	else if (typeof window !== "undefined") ws = window.WebSocket || window.MozWebSocket;
	else if (typeof self !== "undefined") ws = self.WebSocket || self.MozWebSocket;
	var browser_default = ws;

//#endregion
//#region src/server/createWebsocket.ts
	function createWebsocket() {
		return new browser_default(`ws://127.0.0.1:${DEFAULT_WEB_SOCKET_PORT}?WEB_SOCKET_CONNECT_MAGIC_ID=${WEB_SOCKET_CONNECT_MAGIC_ID}`);
	}

//#endregion
//#region src/server/WebClient.ts
	var WebClient = class {
		constructor(options) {
			this._webSocket = null;
			this._name = options.name;
			this.logPrefix = options.logPrefix || "";
			this._connect();
		}
		_connect() {
			console.log(`${this.logPrefix}Trying to connect to {cyan ws://127.0.0.1:${DEFAULT_WEB_SOCKET_PORT}}...}`);
			this._webSocket = createWebsocket();
			this._webSocket.onopen = () => {
				console.log(`${this.logPrefix}Connected to {cyan ws://127.0.0.1:${DEFAULT_WEB_SOCKET_PORT}} success!`);
				const startWebClient = new AddWebClientAction({ name: this._name });
				this._webSocket && this._webSocket.send(JSON.stringify(startWebClient));
			};
			this._webSocket.onmessage = (message) => {
				console.log(message);
				const parsedMessage = JSON.parse(message.data.toString());
				if (parsedMessage.type === "API") {
					if (parsedMessage.kind === APIKind.RELOAD_WEB_CLIENT) {
						const { payload: { name } } = parsedMessage;
						if (name !== this._name) return;
						this._reload();
					}
				}
			};
			this._webSocket.onerror = (err) => {
				console.error(`${this.logPrefix}err: ${err}`);
			};
		}
		_reload() {
			console.log(`${this.logPrefix}reload`);
			location.reload();
		}
	};

//#endregion
//#region src/server/launchWebClient.ts
	new WebClient(__WEB_CLIENT_OPTIONS__);

//#endregion
})();