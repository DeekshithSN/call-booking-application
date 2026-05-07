"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeExecutor = nodeExecutor;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const child_process_1 = require("child_process");
const devkit_1 = require("@nx/devkit");
const async_iterable_1 = require("@nx/devkit/src/utils/async-iterable");
const client_1 = require("nx/src/daemon/client/client");
const crypto_1 = require("crypto");
const path = tslib_1.__importStar(require("path"));
const path_1 = require("path");
const buildable_libs_utils_1 = require("../../utils/buildable-libs-utils");
const kill_tree_1 = require("./lib/kill-tree");
const line_aware_writer_1 = require("./lib/line-aware-writer");
const coalescing_debounce_1 = require("./lib/coalescing-debounce");
const fileutils_1 = require("nx/src/utils/fileutils");
const utils_1 = require("nx/src/tasks-runner/utils");
const detect_module_format_1 = require("./lib/detect-module-format");
const output_file_1 = require("./lib/output-file");
const globalLineAwareWriter = new line_aware_writer_1.LineAwareWriter();
async function* nodeExecutor(options, context) {
    process.env.NODE_ENV ??= context?.configurationName ?? 'development';
    const project = context.projectGraph.nodes[context.projectName];
    const buildTarget = (0, devkit_1.parseTargetString)(options.buildTarget, context);
    if (!project.data.targets[buildTarget.target]) {
        throw new Error(`Cannot find build target ${chalk_1.default.bold(options.buildTarget)} for project ${chalk_1.default.bold(context.projectName)}`);
    }
    const buildTargetExecutor = project.data.targets[buildTarget.target]?.executor;
    if (buildTargetExecutor === 'nx:run-commands') {
        // Run commands does not emit build event, so we have to switch to run entire build through Nx CLI.
        options.runBuildTargetDependencies = true;
    }
    const buildOptions = {
        ...(0, devkit_1.readTargetOptions)(buildTarget, context),
        ...options.buildTargetOptions,
        target: buildTarget.target,
    };
    if (options.waitUntilTargets && options.waitUntilTargets.length > 0) {
        const results = await runWaitUntilTargets(options, context);
        for (const [i, result] of results.entries()) {
            if (!result.success) {
                throw new Error(`Wait until target failed: ${options.waitUntilTargets[i]}.`);
            }
        }
    }
    // Re-map buildable workspace projects to their output directory.
    const mappings = calculateResolveMappings(context, options);
    const fileToRun = getFileToRun(context, project, buildOptions, buildTargetExecutor);
    // Detect module format for the project
    const moduleFormat = (0, detect_module_format_1.detectModuleFormat)({
        projectRoot: project.data.root,
        workspaceRoot: context.root,
        tsConfig: buildOptions.tsConfig ||
            (0, path_1.join)(context.root, project.data.root, 'tsconfig.json'),
        main: buildOptions.main || fileToRun,
        buildOptions,
    });
    let additionalExitHandler = null;
    let currentTask = null;
    const tasks = [];
    yield* (0, async_iterable_1.createAsyncIterable)(async ({ done, next, error, registerCleanup }) => {
        const processQueue = async () => {
            if (tasks.length === 0)
                return;
            const previousTask = currentTask;
            const task = tasks.shift();
            if (previousTask && !previousTask.killed) {
                previousTask.killed = true;
                if (previousTask.childProcess?.connected) {
                    previousTask.childProcess.disconnect();
                }
                previousTask.childProcess?.removeAllListeners();
                await previousTask.stop('SIGTERM');
                await new Promise((resolve) => setImmediate(resolve));
            }
            currentTask = task;
            globalLineAwareWriter.setActiveProcess(task.id);
            await task.start();
        };
        const debouncedProcessQueue = (0, coalescing_debounce_1.createCoalescingDebounce)(processQueue, options.debounce ?? 1_000);
        const addToQueue = async (childProcess, buildResult) => {
            for (const task of tasks) {
                if (!task.killed) {
                    task.killed = true;
                    await task.stop('SIGTERM');
                }
            }
            tasks.length = 0;
            const task = {
                id: (0, crypto_1.randomUUID)(),
                killed: false,
                childProcess,
                promise: null,
                start: async () => {
                    // Wait for build to finish.
                    const result = await buildResult;
                    if (result && !result.success) {
                        // If in watch-mode, don't throw or else the process exits.
                        if (options.watch) {
                            if (!task.killed) {
                                // Only log build error if task was not killed by a new change.
                                devkit_1.logger.error(`Build failed, waiting for changes to restart...`);
                            }
                            return;
                        }
                        else {
                            throw new Error(`Build failed. See above for errors.`);
                        }
                    }
                    if (task.killed)
                        return;
                    // Run the program
                    task.promise = new Promise((resolve, reject) => {
                        const loaderFile = moduleFormat === 'esm'
                            ? 'node-with-esm-loader'
                            : 'node-with-require-overrides';
                        task.childProcess = (0, child_process_1.fork)((0, path_1.join)(__dirname, loaderFile), options.args ?? [], {
                            execArgv: getExecArgv(options),
                            stdio: [0, 'pipe', 'pipe', 'ipc'],
                            env: {
                                ...process.env,
                                NX_FILE_TO_RUN: fileToRunCorrectPath(fileToRun),
                                NX_MAPPINGS: JSON.stringify(mappings),
                            },
                        });
                        task.childProcess.stdout?.on('data', (data) => {
                            globalLineAwareWriter.write(data, task.id);
                        });
                        const handleStdErr = (data) => {
                            if (!options.watch || !task.killed) {
                                if (task.id === globalLineAwareWriter.currentProcessId) {
                                    devkit_1.logger.error(data.toString());
                                }
                            }
                        };
                        task.childProcess.stderr?.on('data', handleStdErr);
                        task.childProcess.once('exit', (code) => {
                            task.childProcess.off('data', handleStdErr);
                            if (options.watch && !task.killed) {
                                devkit_1.logger.info(`NX Process exited with code ${code}, waiting for changes to restart...`);
                            }
                            if (!options.watch) {
                                if (code !== 0) {
                                    error(new Error(`Process exited with code ${code}`));
                                }
                                else {
                                    resolve(done());
                                }
                            }
                            resolve();
                        });
                        next({ success: true, options: buildOptions });
                    });
                },
                stop: async (signal = 'SIGTERM') => {
                    task.killed = true;
                    if (task.childProcess) {
                        if (task.childProcess.stdout) {
                            task.childProcess.stdout.pause();
                        }
                        if (task.childProcess.stderr) {
                            task.childProcess.stderr.pause();
                        }
                        if (task.childProcess.connected) {
                            task.childProcess.disconnect();
                        }
                        task.childProcess.removeAllListeners();
                        await (0, kill_tree_1.killTree)(task.childProcess.pid, signal);
                    }
                    if (task.id === globalLineAwareWriter.currentProcessId) {
                        globalLineAwareWriter.setActiveProcess(null);
                    }
                },
            };
            tasks.push(task);
        };
        const stopAllTasks = async (signal = 'SIGTERM') => {
            debouncedProcessQueue.cancel();
            globalLineAwareWriter.flush();
            if (typeof additionalExitHandler === 'function') {
                additionalExitHandler();
            }
            if (typeof currentTask?.stop === 'function') {
                await currentTask.stop(signal);
            }
            for (const task of tasks) {
                await task.stop(signal);
            }
        };
        process.on('SIGTERM', async () => {
            await stopAllTasks('SIGTERM');
            process.exit(128 + 15);
        });
        process.on('SIGINT', async () => {
            await stopAllTasks('SIGINT');
            process.exit(128 + 2);
        });
        process.on('SIGHUP', async () => {
            await stopAllTasks('SIGHUP');
            process.exit(128 + 1);
        });
        registerCleanup(async () => {
            await stopAllTasks('SIGTERM');
        });
        if (options.runBuildTargetDependencies) {
            // If a all dependencies need to be rebuild on changes, then register with watcher
            // and run through CLI, otherwise only the current project will rebuild.
            const runBuild = async () => {
                let childProcess = null;
                const whenReady = new Promise(async (resolve) => {
                    childProcess = (0, child_process_1.fork)(require.resolve('nx/bin/nx.js'), [
                        'run',
                        `${context.projectName}:${buildTarget.target}${buildTarget.configuration ? `:${buildTarget.configuration}` : ''}`,
                    ], {
                        cwd: context.root,
                        stdio: 'inherit',
                    });
                    childProcess.once('exit', (code) => {
                        if (code === 0)
                            resolve({ success: true });
                        // If process is killed due to current task being killed, then resolve with success.
                        else
                            resolve({ success: !!currentTask?.killed });
                    });
                });
                await addToQueue(childProcess, whenReady);
                await debouncedProcessQueue.trigger();
            };
            if ((0, devkit_1.isDaemonEnabled)()) {
                additionalExitHandler = await client_1.daemonClient.registerFileWatcher({
                    watchProjects: [context.projectName],
                    includeDependentProjects: true,
                }, async (err, data) => {
                    if (err === 'reconnecting') {
                        // Silent - daemon restarts automatically on lockfile changes
                        return;
                    }
                    else if (err === 'reconnected') {
                        // Silent - reconnection succeeded
                        return;
                    }
                    else if (err === 'closed') {
                        devkit_1.logger.error(`Failed to reconnect to daemon after multiple attempts`);
                        process.exit(1);
                    }
                    else if (err) {
                        devkit_1.logger.error(`Watch error: ${err?.message ?? 'Unknown'}`);
                    }
                    else {
                        if (options.watch) {
                            devkit_1.logger.info(`NX File change detected. Restarting...`);
                            await runBuild();
                        }
                    }
                });
            }
            else {
                devkit_1.logger.warn(`NX Daemon is not running. Node process will not restart automatically after file changes.`);
            }
            await runBuild(); // run first build
        }
        else {
            // Otherwise, run the build executor, which will not run task dependencies.
            // This is mostly fine for bundlers like webpack that should already watch for dependency libs.
            // For tsc/swc or custom build commands, consider using `runBuildTargetDependencies` instead.
            const output = await (0, devkit_1.runExecutor)(buildTarget, {
                ...options.buildTargetOptions,
                watch: options.watch,
            }, context);
            while (true) {
                const event = await output.next();
                await addToQueue(null, Promise.resolve(event.value));
                await debouncedProcessQueue.trigger();
                if (event.done && !options.watch) {
                    break;
                }
            }
        }
    });
}
function getExecArgv(options) {
    const args = (options.runtimeArgs ??= []);
    args.push('-r', require.resolve('source-map-support/register'));
    if (options.inspect === true) {
        options.inspect = "inspect" /* InspectType.Inspect */;
    }
    if (options.inspect) {
        args.push(`--${options.inspect}=${options.host}:${options.port}`);
    }
    return args;
}
function calculateResolveMappings(context, options) {
    const parsed = (0, devkit_1.parseTargetString)(options.buildTarget, context);
    const { dependencies } = (0, buildable_libs_utils_1.calculateProjectBuildableDependencies)(context.taskGraph, context.projectGraph, context.root, parsed.project, parsed.target, parsed.configuration);
    return dependencies.reduce((m, c) => {
        if (c.node.type !== 'npm' && c.outputs[0] != null) {
            // `outputs` are cache patterns and may contain globs (e.g. from the
            // inferred `@nx/js/typescript` build target). Strip the glob portion
            // so the runtime require overrides resolve to the actual output dir.
            const outputDir = stripGlobToBaseDir(c.outputs[0]);
            m[c.name] = (0, devkit_1.joinPathFragments)(context.root, outputDir);
        }
        return m;
    }, {});
}
function runWaitUntilTargets(options, context) {
    return Promise.all(options.waitUntilTargets.map(async (waitUntilTarget) => {
        const target = (0, devkit_1.parseTargetString)(waitUntilTarget, context);
        const output = await (0, devkit_1.runExecutor)(target, {}, context);
        return new Promise(async (resolve) => {
            let event = await output.next();
            // Resolve after first event
            resolve(event.value);
            // Continue iterating
            while (!event.done) {
                event = await output.next();
            }
        });
    }));
}
function getFileToRun(context, project, buildOptions, buildTargetExecutor) {
    // If using run-commands or another custom executor, then user should set
    // outputFileName, but we can try the default value that we use.
    if (!buildOptions?.outputPath && !buildOptions?.outputFileName) {
        // If we are using crystal for infering the target, we can use the output path from the target.
        // Since the output path has a token for the project name, we need to interpolate it.
        // {workspaceRoot}/dist/{projectRoot} -> dist/my-app
        const outputPath = project.data.targets[buildOptions.target]?.outputs?.[0];
        if (outputPath) {
            const outputFilePath = (0, utils_1.interpolate)(outputPath, {
                projectName: project.name,
                projectRoot: project.data.root,
                workspaceRoot: context.root,
            });
            // `outputs` are cache patterns and may contain globs (e.g. the inferred
            // `@nx/js/typescript` build target scopes its output to
            // `{projectRoot}/dist/**/*.{js,...}` to avoid caching non-tsc files).
            // Strip the glob portion back to the last path separator before it to
            // recover the base output directory.
            const outputDir = stripGlobToBaseDir(outputFilePath);
            return path.join(outputDir, 'main.js');
        }
        const fallbackFile = path.join('dist', project.data.root, 'main.js');
        devkit_1.logger.warn(`Build option ${chalk_1.default.bold('outputFileName')} not set for ${chalk_1.default.bold(project.name)}. Using fallback value of ${chalk_1.default.bold(fallbackFile)}.`);
        return (0, path_1.join)(context.root, fallbackFile);
    }
    let outputFileName = buildOptions.outputFileName;
    if (!outputFileName) {
        outputFileName = (0, output_file_1.getOutputFileName)({
            buildTargetExecutor,
            main: buildOptions.main,
            outputPath: buildOptions.outputPath,
            rootDir: buildOptions.rootDir ?? project.data.root,
        });
    }
    return (0, path_1.join)(context.root, buildOptions.outputPath, outputFileName);
}
function stripGlobToBaseDir(pathWithGlob) {
    const globIdx = pathWithGlob.search(/[*?[{(]/);
    if (globIdx === -1) {
        return pathWithGlob.replace(/[\\/]+$/, '');
    }
    const prefix = pathWithGlob.slice(0, globIdx);
    const lastSep = Math.max(prefix.lastIndexOf('/'), prefix.lastIndexOf('\\'));
    return lastSep === -1 ? '' : prefix.slice(0, lastSep);
}
function fileToRunCorrectPath(fileToRun) {
    if ((0, fileutils_1.fileExists)(fileToRun))
        return fileToRun;
    const extensionsToTry = ['.cjs', '.mjs', '.cjs.js', '.esm.js'];
    for (const ext of extensionsToTry) {
        const file = fileToRun.replace(/\.js$/, ext);
        if ((0, fileutils_1.fileExists)(file))
            return file;
    }
    throw new Error(`Could not find ${fileToRun}. Make sure your build succeeded.`);
}
exports.default = nodeExecutor;
