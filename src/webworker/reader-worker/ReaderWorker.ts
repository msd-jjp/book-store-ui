import readerWorker from './reader.worker';
import { BaseWorker } from '../worker.base';

export class ReaderWorker extends BaseWorker {
    
    protected _worker: Worker | undefined;

    constructor() {
        super();
        this.init();
    }

    protected init() {
        if (typeof (Worker) !== "undefined") {
            this._worker = new (readerWorker as any)();
        }
    }

    postMessage(data: { book_active_page: number }) {
        if (!this._worker) return;
        this._worker.postMessage(data);
    }

    onmessage(fn: (data: { bookSlideList: any[], active_slide: number }) => void) {
        if (!this._worker) return;
        this._worker.onmessage = (e: MessageEvent) => {
            fn(e.data);
        };
    }

}
