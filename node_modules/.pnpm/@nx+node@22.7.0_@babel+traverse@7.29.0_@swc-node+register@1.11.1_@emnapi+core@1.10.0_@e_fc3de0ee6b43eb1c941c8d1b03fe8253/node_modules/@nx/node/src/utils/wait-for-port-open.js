"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForPortOpen = waitForPortOpen;
const tslib_1 = require("tslib");
const net = tslib_1.__importStar(require("net"));
const devkit_1 = require("@nx/devkit");
/**
 * Waits for the given port to be open
 * @param port
 * @param options
 */
function waitForPortOpen(port, options = {}) {
    const host = options.host ?? 'localhost';
    const allowedErrorCodes = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT'];
    return new Promise((resolve, reject) => {
        const checkPort = (retries = options.retries ?? 120) => {
            const client = new net.Socket();
            const cleanupClient = () => {
                client.removeAllListeners('connect');
                client.removeAllListeners('error');
                client.end();
                client.destroy();
                client.unref();
            };
            client.once('connect', () => {
                cleanupClient();
                resolve();
            });
            client.once('error', (err) => {
                if (retries === 0 || !allowedErrorCodes.includes(err['code'])) {
                    if (process.env['NX_VERBOSE_LOGGING'] === 'true') {
                        devkit_1.logger.info(`Error connecting on ${host}:${port}: ${err['code'] || err}`);
                    }
                    cleanupClient();
                    reject(err);
                }
                else {
                    setTimeout(() => checkPort(retries - 1), options.retryDelay ?? 1000);
                }
            });
            if (process.env['NX_VERBOSE_LOGGING'] === 'true') {
                devkit_1.logger.info(`Connecting on ${host}:${port}`);
            }
            client.connect({ port, host });
        };
        checkPort();
    });
}
