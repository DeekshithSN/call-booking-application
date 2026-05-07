"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGenerator = exports.libraryGenerator = exports.applicationGenerator = void 0;
var application_1 = require("./src/generators/application/application");
Object.defineProperty(exports, "applicationGenerator", { enumerable: true, get: function () { return application_1.applicationGenerator; } });
var library_1 = require("./src/generators/library/library");
Object.defineProperty(exports, "libraryGenerator", { enumerable: true, get: function () { return library_1.libraryGenerator; } });
var init_1 = require("./src/generators/init/init");
Object.defineProperty(exports, "initGenerator", { enumerable: true, get: function () { return init_1.initGenerator; } });
