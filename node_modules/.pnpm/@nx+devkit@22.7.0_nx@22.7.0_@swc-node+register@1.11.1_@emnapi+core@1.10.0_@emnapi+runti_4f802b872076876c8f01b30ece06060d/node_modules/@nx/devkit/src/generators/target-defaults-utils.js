"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBuildTargetDefaults = addBuildTargetDefaults;
exports.addE2eCiTargetDefaults = addE2eCiTargetDefaults;
const devkit_exports_1 = require("nx/src/devkit-exports");
const devkit_internals_1 = require("nx/src/devkit-internals");
function addBuildTargetDefaults(tree, executorName, buildTargetName = 'build', extraInputs = []) {
    const nxJson = (0, devkit_exports_1.readNxJson)(tree);
    nxJson.targetDefaults ??= {};
    nxJson.targetDefaults[executorName] ??= {
        cache: true,
        dependsOn: [`^${buildTargetName}`],
        inputs: [
            ...(nxJson.namedInputs && 'production' in nxJson.namedInputs
                ? ['production', '^production']
                : ['default', '^default']),
            ...extraInputs,
        ],
    };
    (0, devkit_exports_1.updateNxJson)(tree, nxJson);
}
async function addE2eCiTargetDefaults(tree, e2ePlugin, buildTarget, pathToE2EConfigFile) {
    const nxJson = (0, devkit_exports_1.readNxJson)(tree);
    if (!nxJson.plugins) {
        return;
    }
    const e2ePluginRegistrations = nxJson.plugins.filter((p) => typeof p === 'string' ? p === e2ePlugin : p.plugin === e2ePlugin);
    if (!e2ePluginRegistrations.length) {
        return;
    }
    const resolvedE2ePlugin = await Promise.resolve(`${e2ePlugin}`).then(s => __importStar(require(s)));
    const e2ePluginGlob = resolvedE2ePlugin.createNodesV2?.[0] ?? resolvedE2ePlugin.createNodes?.[0];
    let foundPluginForApplication;
    for (let i = 0; i < e2ePluginRegistrations.length; i++) {
        let candidatePluginForApplication = e2ePluginRegistrations[i];
        if (typeof candidatePluginForApplication === 'string') {
            foundPluginForApplication = candidatePluginForApplication;
            break;
        }
        const matchingConfigFiles = (0, devkit_internals_1.findMatchingConfigFiles)([pathToE2EConfigFile], e2ePluginGlob, candidatePluginForApplication.include, candidatePluginForApplication.exclude);
        if (matchingConfigFiles.length) {
            foundPluginForApplication = candidatePluginForApplication;
            break;
        }
    }
    if (!foundPluginForApplication) {
        return;
    }
    const ciTargetName = typeof foundPluginForApplication === 'string'
        ? 'e2e-ci'
        : (foundPluginForApplication.options?.ciTargetName ?? 'e2e-ci');
    const ciTargetNameGlob = `${ciTargetName}--**/**`;
    nxJson.targetDefaults ??= {};
    const e2eCiTargetDefaults = nxJson.targetDefaults[ciTargetNameGlob];
    if (!e2eCiTargetDefaults) {
        nxJson.targetDefaults[ciTargetNameGlob] = {
            dependsOn: [buildTarget],
        };
    }
    else {
        e2eCiTargetDefaults.dependsOn ??= [];
        if (!e2eCiTargetDefaults.dependsOn.includes(buildTarget)) {
            e2eCiTargetDefaults.dependsOn.push(buildTarget);
        }
    }
    (0, devkit_exports_1.updateNxJson)(tree, nxJson);
}
