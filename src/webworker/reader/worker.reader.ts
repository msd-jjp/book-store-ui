import myWorker from './worker/reader.worker';

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
