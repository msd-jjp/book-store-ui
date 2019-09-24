import { BaseWorker } from "../worker.base";
// eslint-disable-next-line import/no-webpack-loader-syntax
// import * as workerPath from "file-loader?name=[name].js!./worker.js";
import myWorker from './worker/reader.worker';

export class ReaderWorker extends BaseWorker {
    constructor() {
        super();
        // this.handler = this.handler.bind(this);
    }
    // worker_url = '/static/webworker/reader/worker.reader.js';
    // worker_url = '/static/webworker/reader/worker.reader.webworker.js';
    worker_url = '';
    init(): Worker | undefined {
        console.log('--------------override----------');
        if (typeof (Worker) === "undefined") return;
        // let vsd: any = myWorker;
        // return new vsd();
        return new (myWorker as  any)();
        // return new myWorker(); //new (myWorker as  any)();
    }

    // worker_url = workerPath;
    handler(e: MessageEvent) {
        if (!e) {
            return;
        }
        const _postMessage: any = postMessage;
        let result = e.data[0] * e.data[1];
        this.waitOnMe(1000);
        if (isNaN(result)) {
            _postMessage('Please write two numbers');
        } else {
            let workerResult = 'Result: ' + result;
            _postMessage(workerResult);
            setTimeout(() => {
                _postMessage(workerResult);
            }, 1000);
        }
    }

    waitOnMe(timer: number = 500): Promise<boolean> {
        return new Promise((res, rej) => {
            setTimeout(function () {
                res(true);
            }, timer);
        });
    }
}
