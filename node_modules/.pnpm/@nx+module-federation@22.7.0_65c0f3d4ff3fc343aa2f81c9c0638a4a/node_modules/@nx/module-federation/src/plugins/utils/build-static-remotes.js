"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStaticRemotes = buildStaticRemotes;
const node_child_process_1 = require("node:child_process");
const path_1 = require("path");
const node_fs_1 = require("node:fs");
const cache_directory_1 = require("nx/src/utils/cache-directory");
const devkit_1 = require("@nx/devkit");
async function buildStaticRemotes(staticRemotesConfig, options, nxBin) {
    const remotes = Object.keys(staticRemotesConfig);
    if (!remotes.length) {
        return;
    }
    const mappedLocationOfRemotes = {};
    for (const app of remotes) {
        mappedLocationOfRemotes[app] = `http${options.ssl ? 's' : ''}://${options.host ?? 'localhost'}:${options.staticRemotesPort}/${staticRemotesConfig[app].urlSegment}`;
    }
    await new Promise((res, rej) => {
        console.log(`NX Building ${remotes.length} static remotes...`);
        const staticProcess = (0, node_child_process_1.fork)(nxBin, [
            'run-many',
            `--target=build`,
            `--projects=${remotes.join(',')}`,
            ...(options.parallel ? [`--parallel=${options.parallel}`] : []),
        ], {
            cwd: devkit_1.workspaceRoot,
            stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
            env: {
                ...process.env,
                WEBPACK_SERVE: 'false',
            },
        });
        // File to debug build failures e.g. 2024-01-01T00_00_0_0Z-build.log'
        const remoteBuildLogFile = (0, path_1.join)(cache_directory_1.workspaceDataDirectory, `${new Date().toISOString().replace(/[:\.]/g, '_')}-build.log`);
        const stdoutStream = (0, node_fs_1.createWriteStream)(remoteBuildLogFile);
        staticProcess.stdout?.on('data', (data) => {
            const ANSII_CODE_REGEX = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
            const stdoutString = data.toString().replace(ANSII_CODE_REGEX, '');
            stdoutStream.write(stdoutString);
            // in addition to writing into the stdout stream, also show error directly in console
            // so the error is easily discoverable. 'ERROR in' is the key word to search in webpack output.
            if (stdoutString.includes('ERROR in')) {
                console.log(stdoutString);
            }
            if (stdoutString.includes('Successfully ran target build')) {
                staticProcess.stdout?.removeAllListeners('data');
                console.info(`NX Built ${remotes.length} static remotes`);
                res();
            }
        });
        staticProcess.stderr?.on('data', (data) => console.log(data.toString()));
        staticProcess.once('exit', (code) => {
            stdoutStream.end();
            staticProcess.stdout?.removeAllListeners('data');
            staticProcess.stderr?.removeAllListeners('data');
            if (code !== 0) {
                rej(`Remote failed to start. A complete log can be found in: ${remoteBuildLogFile}`);
            }
            else {
                res();
            }
        });
        process.on('SIGTERM', () => staticProcess.kill('SIGTERM'));
        process.on('exit', () => staticProcess.kill('SIGTERM'));
    });
    return mappedLocationOfRemotes;
}
