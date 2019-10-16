import /* workerMsg, */ { IReceiveData } from './fetch-interval.worker';
import { BaseWorker } from '../worker.base';
import { CollectionService } from '../../service/service.collection';
import { LibraryService } from '../../service/service.library';
// import { IToken } from '../../model/model.token';
import { Store2 } from '../../redux/store';
import { action_set_library_data } from '../../redux/action/library';
import { action_set_collections_data } from '../../redux/action/collection';

export class FetchIntervalWorker extends BaseWorker {

    protected _worker: Worker | undefined;
    private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();

    // constructor(/* token: IToken */) {
    //     super();
    //     // this._libraryService.setToken(token);
    //     // this._collectionService.setToken(token);
    //     // this.init();
    // }

    protected init() {
        // if (typeof (Worker) !== "undefined") {
        //     this._worker = new (workerMsg as any)();
        // }
    }

    postMessage(data: IReceiveData) {
        // debugger;
        if (data.type === "start") {
            this.start_fetchingData();
        } else if (data.type === "stop") {
            this.stop_fetchingData();
        }
    }
    onmessage() { }

    // postMessage(data: IReceiveData) {
    //     if (!this._worker) return;
    //     debugger;
    //     if (data.type === "start") {
    //         data._libraryService = this._libraryService;
    //     }
    //     this._worker.postMessage(data);
    //     if (data.type === "stop") {
    //         this.terminate();
    //     }
    // }

    // onmessage() {
    //     if (!this._worker) return;
    //     this._worker.onmessage = (e: ISendMessageEvent) => {
    //         debugger;
    //         let ca = e.data.type;
    //         //get data
    //     };
    // }

    private fetch_timeout_timer: number = 30000; // in ms --> 30second
    start_fetchingData() {
        console.log('--------- fetching library & collection started ---------');
        this.fetchLibrary();
        this.fetchCollection();
    }

    stop_fetchingData() {
        clearTimeout(this.fetchLibrary_timeout);
        clearTimeout(this.fetchCollection_timeout);
        console.log('--------- fetching library & collection stoped ---------');
    }

    private fetchLibrary_timeout: any;
    async fetchLibrary() {
        await this._libraryService.getAll().then(res => {
            Store2.dispatch(action_set_library_data(res.data.result));
        }).catch(error => { });

        clearTimeout(this.fetchLibrary_timeout);
        this.fetchLibrary_timeout = setTimeout(() => {
            this.fetchLibrary();
        }, this.fetch_timeout_timer);
    }

    private fetchCollection_timeout: any;
    async fetchCollection() {
        await this._collectionService.getAll().then(res => {
            Store2.dispatch(action_set_collections_data(res.data.result));
        }).catch(error => { });

        clearTimeout(this.fetchCollection_timeout);
        this.fetchCollection_timeout = setTimeout(() => {
            this.fetchCollection();
        }, this.fetch_timeout_timer);
    }

}
