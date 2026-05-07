"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRemoteProxies = startRemoteProxies;
const utils_1 = require("../../utils");
const fs_1 = require("fs");
async function startRemoteProxies(staticRemotesConfig, mappedLocationsOfRemotes, sslOptions, isServer, host = '127.0.0.1') {
    const { createProxyMiddleware } = require('http-proxy-middleware');
    const express = require('express');
    let sslCert;
    let sslKey;
    if (sslOptions && sslOptions.pathToCert && sslOptions.pathToKey) {
        if ((0, fs_1.existsSync)(sslOptions.pathToCert) && (0, fs_1.existsSync)(sslOptions.pathToKey)) {
            sslCert = (0, fs_1.readFileSync)(sslOptions.pathToCert);
            sslKey = (0, fs_1.readFileSync)(sslOptions.pathToKey);
        }
        else {
            console.warn(`Encountered SSL options in project.json, however, the certificate files do not exist in the filesystem. Using http.`);
            console.warn(`Attempted to find '${sslOptions.pathToCert}' and '${sslOptions.pathToKey}'.`);
        }
    }
    const http = require('http');
    const https = require('https');
    const remotes = Object.keys(staticRemotesConfig);
    console.log(`NX Starting static remotes proxies...`);
    let startedProxies = 0;
    let skippedProxies = 0;
    for (const app of remotes) {
        const appConfig = staticRemotesConfig[app];
        // Check if the port is already in use (another MF dev server may have already started a proxy)
        const portInUse = await (0, utils_1.isPortInUse)(appConfig.port, host);
        if (portInUse) {
            console.log(`NX Skipping proxy for ${app} on port ${appConfig.port} - port already in use (likely served by another process)`);
            skippedProxies++;
            continue;
        }
        const expressProxy = express();
        expressProxy.use(createProxyMiddleware({
            target: mappedLocationsOfRemotes[app],
            changeOrigin: true,
            secure: sslCert ? false : undefined,
            pathRewrite: isServer
                ? (path) => {
                    if (path.includes('/server')) {
                        return path;
                    }
                    else {
                        return `browser/${path}`;
                    }
                }
                : undefined,
        }));
        const proxyServer = (sslCert ? https : http)
            .createServer({ cert: sslCert, key: sslKey }, expressProxy)
            .listen(appConfig.port);
        process.on('SIGTERM', () => proxyServer.close());
        process.on('exit', () => proxyServer.close());
        startedProxies++;
    }
    if (skippedProxies > 0) {
        console.info(`NX Static remotes proxies: started ${startedProxies}, skipped ${skippedProxies} (already running)`);
    }
    else {
        console.info(`NX Static remotes proxies started successfully`);
    }
}
