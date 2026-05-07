"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVSCodeDebugConfiguration = addVSCodeDebugConfiguration;
const devkit_1 = require("@nx/devkit");
function findFreeDebugPort(tree) {
    let highestPort = 0;
    // Check existing launch.json configurations for used debug ports
    if (tree.exists('.vscode/launch.json')) {
        try {
            const launchConfig = JSON.parse(tree.read('.vscode/launch.json', 'utf-8'));
            if (launchConfig.configurations) {
                for (const config of launchConfig.configurations) {
                    if (config.env && config.env.NODE_OPTIONS) {
                        const match = config.env.NODE_OPTIONS.match(/--inspect=(\d+)/);
                        if (match) {
                            const currentPort = parseInt(match[1]);
                            highestPort = Math.max(highestPort, currentPort);
                        }
                    }
                }
            }
        }
        catch {
            // Ignore parsing errors
        }
    }
    // Return the next available port after the highest used port, or 9229 if none are used
    return highestPort > 0 ? highestPort + 1 : 9229;
}
function addVSCodeDebugConfiguration(tree, options) {
    // `getPackageManagerCommand().exec` returns the full subcommand string,
    // e.g. `pnpm exec` for pnpm or `npm exec --` for npm. VS Code's
    // `runtimeExecutable` expects an actual executable path, not a string
    // with embedded arguments — passing `"pnpm exec"` fails on Windows with
    // `Can't find Node.js binary "pnpm exec": path does not exist`. Split
    // the command and prepend any extra tokens to runtimeArgs. (#35276)
    const pmCommandTokens = (0, devkit_1.getPackageManagerCommand)().exec.split(' ');
    const runtimeExecutable = pmCommandTokens[0];
    const extraExecArgs = pmCommandTokens.slice(1);
    // Determine the output path based on project configuration
    let outputPath;
    try {
        const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.projectName);
        outputPath = projectConfig.targets?.build?.options?.outputPath;
    }
    catch {
        outputPath = undefined;
    }
    // If no outputPath is configured, assume it's in the project directory
    if (!outputPath) {
        outputPath = `${options.projectRoot}/dist`;
    }
    // Find a free debug port to avoid conflicts
    const debugPort = findFreeDebugPort(tree);
    const debugConfig = {
        type: 'node',
        request: 'launch',
        name: `Debug ${options.projectName} with Nx`,
        runtimeExecutable,
        runtimeArgs: [...extraExecArgs, 'nx', 'serve', options.projectName],
        env: {
            NODE_OPTIONS: `--inspect=${debugPort}`,
        },
        console: 'integratedTerminal',
        internalConsoleOptions: 'neverOpen',
        skipFiles: ['<node_internals>/**'],
        sourceMaps: true,
        outFiles: [
            `\${workspaceFolder}/${outputPath}/**/*.(m|c|)js`,
            '!**/node_modules/**',
        ],
    };
    if (!tree.exists('.vscode/launch.json')) {
        // Create launch.json with the configuration
        (0, devkit_1.writeJson)(tree, '.vscode/launch.json', {
            version: '0.2.0',
            configurations: [debugConfig],
        });
    }
    else {
        // Add configuration to existing launch.json
        (0, devkit_1.updateJson)(tree, '.vscode/launch.json', (json) => {
            if (!json.configurations) {
                json.configurations = [];
            }
            json.configurations.push(debugConfig);
            return json;
        });
    }
}
