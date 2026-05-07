"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPortInUse = isPortInUse;
const wait_for_port_open_1 = require("@nx/web/src/utils/wait-for-port-open");
/**
 * Check if a port is already in use by attempting to connect to it.
 * Uses waitForPortOpen with retries: 0 for an immediate check.
 */
async function isPortInUse(port, host = 'localhost') {
    try {
        await (0, wait_for_port_open_1.waitForPortOpen)(port, { retries: 0, host });
        return true; // Port is open/in use
    }
    catch {
        return false; // Port is not in use
    }
}
