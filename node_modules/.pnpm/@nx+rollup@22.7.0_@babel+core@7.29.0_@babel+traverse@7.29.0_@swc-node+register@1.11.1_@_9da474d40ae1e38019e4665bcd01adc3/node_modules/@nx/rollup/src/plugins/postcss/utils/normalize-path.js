"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = normalizePath;
exports.humanizePath = humanizePath;
/**
 * Normalize file path to use forward slashes (POSIX style)
 * This ensures consistent path handling across Windows and Unix systems
 */
function normalizePath(path) {
    if (!path) {
        return '';
    }
    return path.replace(/\\+/g, '/');
}
/**
 * Convert an absolute path to a human-readable relative path from cwd
 */
function humanizePath(filepath) {
    const { relative } = require('path');
    return normalizePath(relative(process.cwd(), filepath));
}
