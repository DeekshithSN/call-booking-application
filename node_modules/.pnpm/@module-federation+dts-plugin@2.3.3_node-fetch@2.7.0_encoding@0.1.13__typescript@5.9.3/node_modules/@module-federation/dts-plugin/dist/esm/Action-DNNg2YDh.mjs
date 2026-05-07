//#region src/server/message/Message.ts
var Message = class {
	constructor(type, kind) {
		this.type = type;
		this.kind = kind;
		this.time = Date.now();
	}
};

//#endregion
//#region src/server/constant.ts
const DEFAULT_WEB_SOCKET_PORT = 16322;
const WEB_SOCKET_CONNECT_MAGIC_ID = "1hpzW-zo2z-o8io-gfmV1-2cb1d82";
const MF_SERVER_IDENTIFIER = "Module Federation DTS";
const WEB_CLIENT_OPTIONS_IDENTIFIER = "__WEB_CLIENT_OPTIONS__";
const DEFAULT_TAR_NAME = "@mf-types.zip";
let UpdateMode = /* @__PURE__ */ function(UpdateMode) {
	UpdateMode["POSITIVE"] = "POSITIVE";
	UpdateMode["PASSIVE"] = "PASSIVE";
	return UpdateMode;
}({});

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
export { MF_SERVER_IDENTIFIER as a, WEB_SOCKET_CONNECT_MAGIC_ID as c, DEFAULT_WEB_SOCKET_PORT as i, Message as l, ActionKind as n, UpdateMode as o, DEFAULT_TAR_NAME as r, WEB_CLIENT_OPTIONS_IDENTIFIER as s, Action as t };