// eslint-disable-next-line import/no-webpack-loader-syntax
// import * as workerPath from "worker-loader!./worker/reader.worker";
import reader_worker from './worker/reader.worker';
// import reader_onmessage from './worker/reader.onmessage';
import { getBookSlideList_mock, calc_active_slide, SampleFetch } from './worker/mock';
// import { Store2 } from '../../redux/store';
import { IToken } from '../../model/model.token';
// import MyWorkerss = require('worker-loader!./worker/reader.worker');
// eslint-disable-next-line import/no-webpack-loader-syntax
// const myWorker2 = require('worker!./worker/reader.worker'); // webpack's worker-loader
// eslint-disable-next-line import/no-webpack-loader-syntax
// const myWorker2 = require('worker!../../webworker/reader/worker/reader.worker');



interface IReaderWorker extends Worker {

}

export class ReaderWorker {
    // constructor(){
    //     if (typeof (Worker) === "undefined") return;
    //     return new (myWorker as  any)();
    // }

    init__(): Worker | undefined {
        if (typeof (Worker) === "undefined") return;
        return new (reader_worker as any)();
    }
    init2(): Worker | undefined {
        if (typeof (Worker) === "undefined") return;
        debugger;
        return new (this.message() as any)();
    }
    init3(token: IToken): Worker | undefined {
        // SampleFetch.fetchLibrary(token);

        if (typeof (Worker) === "undefined") return;
        // return new (reader_onmessage as any)();
    }
    init(token: IToken): Worker | undefined {
        // SampleFetch.fetchLibrary(token);

        if (typeof (Worker) === "undefined") return;
        return new (reader_worker as any)();
    }

    message() {
        const self = this;
        return onmessage = async function (e: MessageEvent) {
            // if (!e.data.book_id || !e.data.library) return;
            // if (!e.data.book_active_page) return;
            let bookSlideList = await self.getBookSlideList();
            let active_slide;
            if (e.data.book_active_page) {
                active_slide = calc_active_slide(bookSlideList, e.data.book_active_page)
            }
            postMessage({ bookSlideList, active_slide });
        }
    }
    getBookSlideList() {
        return new Promise(res => {
            res(getBookSlideList_mock());
        });
    }

    private Store_cart() {
        // return Store2.getState().cart;
    }

}
