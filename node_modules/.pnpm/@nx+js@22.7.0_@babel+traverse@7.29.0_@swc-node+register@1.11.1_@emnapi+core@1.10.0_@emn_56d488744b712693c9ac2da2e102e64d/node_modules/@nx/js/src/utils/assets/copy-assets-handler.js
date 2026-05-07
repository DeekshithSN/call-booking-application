"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyAssetsHandler = exports.defaultFileEventHandler = exports.getAssetOutputPath = exports.normalizeAssets = void 0;
const tslib_1 = require("tslib");
const picomatch = require("picomatch");
const node_fs_1 = require("node:fs");
const pathPosix = tslib_1.__importStar(require("node:path/posix"));
const path = tslib_1.__importStar(require("node:path"));
const ignore_1 = tslib_1.__importDefault(require("ignore"));
const tinyglobby_1 = require("tinyglobby");
const normalize_assets_1 = require("./normalize-assets");
Object.defineProperty(exports, "normalizeAssets", { enumerable: true, get: function () { return normalize_assets_1.normalizeAssets; } });
Object.defineProperty(exports, "getAssetOutputPath", { enumerable: true, get: function () { return normalize_assets_1.getAssetOutputPath; } });
const devkit_1 = require("@nx/devkit");
const client_1 = require("nx/src/daemon/client/client");
const picocolors_1 = require("picocolors");
const defaultFileEventHandler = (events) => {
    const dirs = new Set(events.map((event) => path.dirname(event.dest)));
    dirs.forEach((d) => (0, node_fs_1.mkdirSync)(d, { recursive: true }));
    events.forEach((event) => {
        if (event.type === 'create' || event.type === 'update') {
            if ((0, node_fs_1.lstatSync)(event.src).isFile()) {
                (0, node_fs_1.copyFileSync)(event.src, event.dest);
            }
        }
        else if (event.type === 'delete') {
            (0, node_fs_1.rmSync)(event.dest, { recursive: true, force: true });
        }
        else {
            devkit_1.logger.error(`Unknown file event: ${event.type}`);
        }
        const eventDir = path.dirname(event.src);
        const relativeDest = path.relative(eventDir, event.dest);
        devkit_1.logger.verbose(`\n${(0, picocolors_1.dim)(relativeDest)}`);
    });
};
exports.defaultFileEventHandler = defaultFileEventHandler;
class CopyAssetsHandler {
    constructor(opts) {
        this.rootDir = opts.rootDir;
        this.projectDir = opts.projectDir;
        this.outputDir = opts.outputDir;
        this.callback = opts.callback ?? exports.defaultFileEventHandler;
        this.includeIgnoredFiles = opts.includeIgnoredFiles ?? false;
        // TODO(jack): Should handle nested .gitignore files
        this.ignore = (0, ignore_1.default)();
        const gitignore = pathPosix.join(opts.rootDir, '.gitignore');
        const nxignore = pathPosix.join(opts.rootDir, '.nxignore');
        if ((0, node_fs_1.existsSync)(gitignore)) {
            this.ignore.add((0, node_fs_1.readFileSync)(gitignore).toString());
        }
        if ((0, node_fs_1.existsSync)(nxignore)) {
            this.ignore.add((0, node_fs_1.readFileSync)(nxignore).toString());
        }
        this.assetGlobs = (0, normalize_assets_1.normalizeAssets)(opts.assets, opts.rootDir, opts.projectDir, opts.outputDir);
    }
    async processAllAssetsOnce() {
        await Promise.all(this.assetGlobs.map(async (ag) => {
            const pattern = this.normalizeAssetPattern(ag);
            // globbing only supports Unix paths
            const files = await (0, tinyglobby_1.globSync)(pattern.replace(/\\/g, '/'), {
                cwd: this.rootDir,
                dot: true, // enable hidden files
                expandDirectories: false,
                // Only ignore node_modules when the pattern doesn't explicitly reference it.
                // This allows copying generated files from node_modules (e.g., Prisma client)
                // while avoiding performance issues from scanning all node_modules for other patterns.
                ignore: this.getIgnorePatternsForAsset(ag),
            });
            this.callback(this.filesToEvent(files, ag));
        }));
    }
    processAllAssetsOnceSync() {
        this.assetGlobs.forEach((ag) => {
            const pattern = this.normalizeAssetPattern(ag);
            // globbing only supports Unix paths
            const files = (0, tinyglobby_1.globSync)(pattern.replace(/\\/g, '/'), {
                cwd: this.rootDir,
                dot: true, // enable hidden files
                expandDirectories: false,
                ignore: this.getIgnorePatternsForAsset(ag),
            });
            this.callback(this.filesToEvent(files, ag));
        });
    }
    getIgnorePatternsForAsset(ag) {
        // If the asset input path starts with 'node_modules', allow traversing node_modules
        // for that specific pattern. This enables copying generated files like Prisma client.
        const inputStartsWithNodeModules = ag.input.startsWith('node_modules/') || ag.input === 'node_modules';
        if (inputStartsWithNodeModules) {
            return ['**/.git/**'];
        }
        return ['**/node_modules/**', '**/.git/**'];
    }
    async watchAndProcessOnAssetChange() {
        const unregisterFileWatcher = await client_1.daemonClient.registerFileWatcher({
            watchProjects: 'all',
            includeGlobalWorkspaceFiles: true,
        }, (err, data) => {
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
                this.processWatchEvents(data.changedFiles);
            }
        });
        return () => unregisterFileWatcher();
    }
    async processWatchEvents(events) {
        if (events.length === 0)
            return;
        const fileEvents = [];
        for (const event of events) {
            const pathFromRoot = event.path.startsWith(this.rootDir)
                ? path.relative(this.rootDir, event.path)
                : event.path;
            for (const ag of this.assetGlobs) {
                if (picomatch(ag.pattern)(pathFromRoot) &&
                    !ag.ignore?.some((ig) => picomatch(ig)(pathFromRoot)) &&
                    ((ag.includeIgnoredFiles ?? this.includeIgnoredFiles) ||
                        !this.ignore.ignores(pathFromRoot))) {
                    const relPath = path.relative(ag.input, pathFromRoot);
                    const destPath = relPath.startsWith('..') ? pathFromRoot : relPath;
                    fileEvents.push({
                        type: event.type,
                        src: path.join(this.rootDir, pathFromRoot),
                        dest: path.join(this.rootDir, ag.output, destPath),
                    });
                    // Match first entry and skip the rest for this file.
                    break;
                }
            }
        }
        if (fileEvents.length > 0)
            this.callback(fileEvents);
    }
    filesToEvent(files, assetGlob) {
        return files.reduce((acc, src) => {
            if (!assetGlob.ignore?.some((ig) => picomatch(ig)(src)) &&
                ((assetGlob.includeIgnoredFiles ?? this.includeIgnoredFiles) ||
                    !this.ignore.ignores(src))) {
                acc.push({
                    type: 'create',
                    src: path.join(this.rootDir, src),
                    dest: path.join(this.rootDir, (0, normalize_assets_1.getAssetOutputPath)(src, assetGlob)),
                });
            }
            return acc;
        }, []);
    }
    normalizeAssetPattern(assetEntry) {
        return typeof assetEntry === 'string' ? assetEntry : assetEntry.pattern;
    }
}
exports.CopyAssetsHandler = CopyAssetsHandler;
