"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const vitest_impl_1 = tslib_1.__importDefault(require("./vitest.impl"));
exports.default = (0, devkit_1.convertNxExecutor)(vitest_impl_1.default);
