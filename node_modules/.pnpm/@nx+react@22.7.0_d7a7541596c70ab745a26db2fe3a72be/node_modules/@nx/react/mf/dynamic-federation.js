"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRemoteUrlResolver = setRemoteUrlResolver;
exports.setRemoteDefinitions = setRemoteDefinitions;
exports.setRemoteDefinition = setRemoteDefinition;
exports.loadRemoteModule = loadRemoteModule;
const url_helpers_1 = require("@nx/module-federation/url-helpers");
let remoteUrlDefinitions;
let resolveRemoteUrl;
const remoteModuleMap = new Map();
const remoteContainerMap = new Map();
let initialSharingScopeCreated = false;
/**
 * @deprecated Use Runtime Helpers from '@module-federation/enhanced/runtime' instead. This will be removed in Nx 22.
 */
function setRemoteUrlResolver(_resolveRemoteUrl) {
    resolveRemoteUrl = _resolveRemoteUrl;
}
/**
 * @deprecated Use init() from '@module-federation/enhanced/runtime' instead. This will be removed in Nx 22.
 * If you have a remote app called `my-remote-app` and you want to use the `http://localhost:4201/mf-manifest.json` as the remote url, you should change it from:
 * ```ts
 * import { setRemoteDefinitions } from '@nx/react/mf';
 *
 * setRemoteDefinitions({
 *   'my-remote-app': 'http://localhost:4201/mf-manifest.json'
 * });
 * ```
 * to use init():
 * ```ts
 * import { init } from '@module-federation/enhanced/runtime';
 *
 * init({
 *   name: 'host',
 *   remotes: [{
 *     name: 'my-remote-app',
 *     entry: 'http://localhost:4201/mf-manifest.json'
 *   }]
 * });
 * ```
 */
function setRemoteDefinitions(definitions) {
    remoteUrlDefinitions = definitions;
}
/**
 * @deprecated Use registerRemotes() from '@module-federation/enhanced/runtime' instead. This will be removed in Nx 22.
 * If you set a remote app with `setRemoteDefinition` such as:
 * ```ts
 * import { setRemoteDefinition } from '@nx/react/mf';
 *
 * setRemoteDefinition(
 *   'my-remote-app',
 *   'http://localhost:4201/mf-manifest.json'
 * );
 * ```
 * change it to use registerRemotes():
 * ```ts
 * import { registerRemotes } from '@module-federation/enhanced/runtime';
 *
 * registerRemotes([
 *  {
 *     name: 'my-remote-app',
 *     entry: 'http://localhost:4201/mf-manifest.json'
 *   }
 * ]);
 * ```
 */
function setRemoteDefinition(remoteName, remoteUrl) {
    remoteUrlDefinitions ??= {};
    remoteUrlDefinitions[remoteName] = remoteUrl;
}
/**
 * @deprecated Use loadRemote() from '@module-federation/enhanced/runtime' instead. This will be removed in Nx 22.
 * If you set a load a remote with `loadRemoteModule` such as:
 * ```ts
 * import { loadRemoteModule } from '@nx/react/mf';
 *
 * loadRemoteModule('my-remote-app', './Module').then(m => m.RemoteEntryModule);
 * ```
 * change it to use loadRemote():
 * ```ts
 * import { loadRemote } from '@module-federation/enhanced/runtime';
 *
 * loadRemote<typeof import('my-remote-app/Module')>('my-remote-app/Module').then(m => m.RemoteEntryModule);
 * ```
 */
async function loadRemoteModule(remoteName, moduleName) {
    const remoteModuleKey = `${remoteName}:${moduleName}`;
    if (remoteModuleMap.has(remoteModuleKey)) {
        return remoteModuleMap.get(remoteModuleKey);
    }
    const container = remoteContainerMap.has(remoteName)
        ? remoteContainerMap.get(remoteName)
        : await loadRemoteContainer(remoteName);
    const factory = await container.get(moduleName);
    const Module = factory();
    remoteModuleMap.set(remoteModuleKey, Module);
    return Module;
}
const fetchRemoteModule = (url, remoteName) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
            const proxy = {
                get: (request) => window[remoteName].get(request),
                init: (arg) => {
                    try {
                        window[remoteName].init(arg);
                    }
                    catch (e) {
                        console.error(`Failed to initialize remote ${remoteName}`, e);
                        reject(e);
                    }
                },
            };
            resolve(proxy);
        };
        script.onerror = () => reject(new Error(`Remote ${remoteName} not found`));
        document.head.appendChild(script);
    });
};
async function loadRemoteContainer(remoteName) {
    if (!resolveRemoteUrl && !remoteUrlDefinitions) {
        throw new Error('Call setRemoteDefinitions or setRemoteUrlResolver to allow Dynamic Federation to find the remote apps correctly.');
    }
    if (!initialSharingScopeCreated) {
        initialSharingScopeCreated = true;
        await __webpack_init_sharing__('default');
    }
    const remoteUrl = remoteUrlDefinitions
        ? remoteUrlDefinitions[remoteName]
        : await resolveRemoteUrl(remoteName);
    const containerUrl = (0, url_helpers_1.processRuntimeRemoteUrl)(remoteUrl, 'mjs');
    const container = await fetchRemoteModule(containerUrl, remoteName);
    await container.init(__webpack_share_scopes__.default);
    remoteContainerMap.set(remoteName, container);
    return container;
}
