// eslint-disable-next-line import/no-webpack-loader-syntax
// import * as workerPath from "worker-loader!./worker/reader.worker";
import myWorker from './worker/reader.worker';
// import MyWorkerss = require('worker-loader!./worker/reader.worker');


interface IReaderWorker extends Worker{

}

export class ReaderWorker {
    // constructor(){
    //     if (typeof (Worker) === "undefined") return;
    //     return new (myWorker as  any)();
    // }

    init(): Worker | undefined {
        if (typeof (Worker) === "undefined") return;
        return new (myWorker as any)();
    }

}
