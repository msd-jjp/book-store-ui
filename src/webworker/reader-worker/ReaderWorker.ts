import readerWorker from './reader.worker';
import { IToken } from '../../model/model.token';
import { BaseWorker } from '../worker.base';

export class ReaderWorker extends BaseWorker {
    // constructor(){
    //     if (typeof (Worker) === "undefined") return;
    //     return new (myWorker as  any)();
    // }

    init(token:IToken): Worker | undefined {
        if (typeof (Worker) === "undefined") return;
        return new (readerWorker as any)();
    }

    
}
