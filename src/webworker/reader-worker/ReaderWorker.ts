import readerWorker from './reader.worker';
import { IToken } from '../../model/model.token';
import { BaseWorker } from '../worker.base';
import { Store2 } from '../../redux/store';
// const readerWorker = require('./reader.worker');

export class ReaderWorker extends BaseWorker {
    // constructor(){
    //     if (typeof (Worker) === "undefined") return;
    //     return new (myWorker as  any)();
    // }

    init(token: IToken): Worker | undefined {
        if (typeof (Worker) === "undefined") return;
        console.log(this.Store_cart());
        return new (readerWorker as any)();
    }

    Store_cart() {
        return Store2.getState().cart;
    }

}
