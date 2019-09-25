export abstract class BaseWorker {
    protected abstract _worker: Worker | undefined;

    constructor() {
        if (typeof (Worker) === "undefined") {
            console.error('your browser is not support web worker.');
        }
    }

    protected abstract init(...p: any): void;

    protected abstract postMessage(...arg: any): void;

    protected abstract onmessage(fn: (...arg: any) => void): void;

    terminate() {
        if (!this._worker) return;
        this._worker.terminate();
    }
}