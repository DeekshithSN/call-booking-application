"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticRemotes = getStaticRemotes;
const wait_for_port_open_1 = require("@nx/web/src/utils/wait-for-port-open");
async function getStaticRemotes(remotesConfig, devRemoteFindOptions, host = '127.0.0.1') {
    const remotes = Object.keys(remotesConfig);
    const findStaticRemotesPromises = [];
    for (const remote of remotes) {
        findStaticRemotesPromises.push(new Promise((resolve, reject) => {
            (0, wait_for_port_open_1.waitForPortOpen)(remotesConfig[remote].port, {
                retries: devRemoteFindOptions?.retries ?? 3,
                retryDelay: devRemoteFindOptions?.retryDelay ?? 1000,
                host,
            }).then((res) => {
                resolve(undefined);
            }, (rej) => {
                resolve(remote);
            });
        }));
    }
    const staticRemoteNames = (await Promise.all(findStaticRemotesPromises)).filter(Boolean);
    let staticRemotesConfig = {};
    for (const remote of staticRemoteNames) {
        staticRemotesConfig[remote] = remotesConfig[remote];
    }
    return staticRemotesConfig;
}
