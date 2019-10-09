import /* workerMsg, */ { IReceiveData } from './sync.worker';
import { BaseWorker } from '../worker.base';
import { CollectionService } from '../../service/service.collection';
import { LibraryService } from '../../service/service.library';
import { IToken } from '../../model/model.token';
import { Store2 } from '../../redux/store';
import { action_set_library_data } from '../../redux/action/library';
import { action_set_collections_data } from '../../redux/action/collection';

export class SyncWorker extends BaseWorker {

    protected _worker: Worker | undefined;
    private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();

    constructor(token: IToken) {
        super();
        this._libraryService.setToken(token);
        this._collectionService.setToken(token);
        // this.init();
    }

    protected init() {
        // if (typeof (Worker) !== "undefined") {
        //     this._worker = new (workerMsg as any)();
        // }
    }

    postMessage(data: IReceiveData) {

    }
    onmessage() { }



    /**
     * check if user access updated?
     */
    isAccessChanged() { }

    /**
     * send all existing books id list, and wait for list of id that is removed.
     */
    whichBook_isRemoved() { }

    /**
     * send all existing comments id list, and wait for list of id that is removed.
     */
    whichComment_isRemoved() { }

}
