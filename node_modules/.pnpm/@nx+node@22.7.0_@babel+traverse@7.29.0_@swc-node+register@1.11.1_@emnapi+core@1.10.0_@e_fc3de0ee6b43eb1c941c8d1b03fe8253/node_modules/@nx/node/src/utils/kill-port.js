"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kill = void 0;
exports.killPort = killPort;
const devkit_1 = require("@nx/devkit");
const tcp_port_used_1 = require("tcp-port-used");
exports.kill = require('kill-port');
/**
 * Kills the process on the given port
 * @param port
 * @param killPortDelay
 */
async function killPort(port, killPortDelay = 2500) {
    if (await (0, tcp_port_used_1.check)(port)) {
        let killPortResult;
        try {
            devkit_1.logger.info(`Attempting to close port ${port}`);
            killPortResult = await (0, exports.kill)(port);
            await new Promise((resolve) => setTimeout(() => resolve(), killPortDelay));
            if (await (0, tcp_port_used_1.check)(port)) {
                devkit_1.logger.error(`Port ${port} still open ${JSON.stringify(killPortResult)}`);
            }
            else {
                devkit_1.logger.info(`Port ${port} successfully closed`);
                return true;
            }
        }
        catch {
            devkit_1.logger.error(`Port ${port} closing failed`);
        }
        return false;
    }
    else {
        return true;
    }
}
