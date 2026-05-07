"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const file_server_impl_1 = tslib_1.__importDefault(require("./file-server.impl"));
exports.default = (0, devkit_1.convertNxExecutor)(file_server_impl_1.default);
