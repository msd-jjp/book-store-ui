import reader2Worker, { IReader2_msg } from './reader2.worker';
import { BaseWorker } from '../worker.base';
import { MsdBookGenerator } from '../reader-engine/MsdBookGenerator';

export class Reader2Worker extends BaseWorker {

    protected _worker: Worker | undefined;

    constructor() {
        super();
        this.init();
    }

    protected init() {
        if (typeof (Worker) !== "undefined") {
            this._worker = new (reader2Worker as any)();
        }
    }

    postMessage(data: IReader2_msg['data']) {
        if (!this._worker) return;
        debugger;
        this._worker.postMessage({ data });
    }

    onmessage(fn: (book: MsdBookGenerator) => void) {
        if (!this._worker) return;
        debugger;
        this._worker.onmessage = (e: MessageEvent) => {
            debugger;
            fn(e.data);
        };
    }

}
