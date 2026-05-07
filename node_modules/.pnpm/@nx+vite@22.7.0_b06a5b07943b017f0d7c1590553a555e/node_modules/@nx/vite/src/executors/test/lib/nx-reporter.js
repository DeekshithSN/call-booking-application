"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NxReporter = void 0;
class NxReporter {
    constructor(watch) {
        this.watch = watch;
        this.setupDeferred();
    }
    async *[Symbol.asyncIterator]() {
        do {
            const hasErrors = await this.deferred.promise;
            yield { hasErrors };
            this.setupDeferred();
        } while (this.watch);
    }
    setupDeferred() {
        let resolve;
        this.deferred = {
            promise: new Promise((res) => {
                resolve = res;
            }),
            resolve,
        };
    }
    /** Vitest ≥ 0.29 */
    onTestRunEnd(files, errors) {
        this._handleFinished(files, errors);
    }
    /** Vitest ≤ 0.28 */
    onFinished(files, errors) {
        this._handleFinished(files, errors);
    }
    // --- private ----------------------------------------------------------
    _handleFinished(files, errors) {
        const hasErrors = files.some((f) => f.result?.state === 'fail') || errors?.length > 0;
        this.deferred.resolve(hasErrors);
    }
}
exports.NxReporter = NxReporter;
