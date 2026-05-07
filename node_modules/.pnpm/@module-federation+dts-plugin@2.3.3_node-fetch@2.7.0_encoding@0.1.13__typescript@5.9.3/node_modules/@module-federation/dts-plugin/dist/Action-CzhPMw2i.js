//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) {
		__defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	}
	if (!no_symbols) {
		__defProp(target, Symbol.toStringTag, { value: "Module" });
	}
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) {
				__defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
		}
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

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
Object.defineProperty(exports, 'Action', {
  enumerable: true,
  get: function () {
    return Action;
  }
});
Object.defineProperty(exports, 'ActionKind', {
  enumerable: true,
  get: function () {
    return ActionKind;
  }
});
Object.defineProperty(exports, 'DEFAULT_TAR_NAME', {
  enumerable: true,
  get: function () {
    return DEFAULT_TAR_NAME;
  }
});
Object.defineProperty(exports, 'DEFAULT_WEB_SOCKET_PORT', {
  enumerable: true,
  get: function () {
    return DEFAULT_WEB_SOCKET_PORT;
  }
});
Object.defineProperty(exports, 'MF_SERVER_IDENTIFIER', {
  enumerable: true,
  get: function () {
    return MF_SERVER_IDENTIFIER;
  }
});
Object.defineProperty(exports, 'Message', {
  enumerable: true,
  get: function () {
    return Message;
  }
});
Object.defineProperty(exports, 'UpdateMode', {
  enumerable: true,
  get: function () {
    return UpdateMode;
  }
});
Object.defineProperty(exports, 'WEB_CLIENT_OPTIONS_IDENTIFIER', {
  enumerable: true,
  get: function () {
    return WEB_CLIENT_OPTIONS_IDENTIFIER;
  }
});
Object.defineProperty(exports, 'WEB_SOCKET_CONNECT_MAGIC_ID', {
  enumerable: true,
  get: function () {
    return WEB_SOCKET_CONNECT_MAGIC_ID;
  }
});
Object.defineProperty(exports, '__exportAll', {
  enumerable: true,
  get: function () {
    return __exportAll;
  }
});
Object.defineProperty(exports, '__toESM', {
  enumerable: true,
  get: function () {
    return __toESM;
  }
});