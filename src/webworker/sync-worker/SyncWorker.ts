import /* workerMsg, */ { IReceiveData } from './sync.worker';
import { BaseWorker } from '../worker.base';
import { CollectionService } from '../../service/service.collection';
import { LibraryService } from '../../service/service.library';
import { IToken } from '../../model/model.token';
import { Store2 } from '../../redux/store';
import { action_set_sync } from '../../redux/action/sync';

import { CmpUtility } from '../../component/_base/CmpUtility';
interface ISyncStatusItem {
    inProgress: boolean;
    error: any;
}

interface ISyncStatus {
    isAccessChanged: ISyncStatusItem;
    whichBook_isRemoved: ISyncStatusItem;
    whichComment_isRemoved: ISyncStatusItem;
}


export class SyncWorker extends BaseWorker {

    protected _worker: Worker | undefined;
    private _syncStatus!: ISyncStatus;
    private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();

    constructor(token: IToken) {
        super();
        this._libraryService.setToken(token);
        this._collectionService.setToken(token);
        // this.init();

        this.reset_syncStatus(false);
    }

    protected init() {
        // if (typeof (Worker) !== "undefined") {
        //     this._worker = new (workerMsg as any)();
        // }
    }

    postMessage(data: IReceiveData) {
        if (data === "start" || data === "start_visible") {
            this.startSyncing(data === "start_visible");
        } else if (data === "check") {
            if (Store2.getState().sync.isSyncing_hidden) {
                this.startSyncing();
            }
        } else if (data === "stop") {
            Store2.dispatch(action_set_sync({
                ...Store2.getState().sync,
                isSyncing_hidden: false,
                isSyncing_visible: false,
            }));
        }
    }

    onmessage() { }

    private async startSyncing(visible = false) {
        this.reset_syncStatus(true);

        Store2.dispatch(action_set_sync({
            ...Store2.getState().sync,
            isSyncing_hidden: true,
            isSyncing_visible: visible,
            errorText: undefined
        }));

        this.isAccessChanged();
        this.whichBook_isRemoved();
        this.whichComment_isRemoved();
    }

    reset_syncStatus(inProgress: boolean) {
        this._syncStatus = {
            isAccessChanged: {
                inProgress: inProgress,
                error: undefined
            },
            whichBook_isRemoved: {
                inProgress: inProgress,
                error: undefined
            },
            whichComment_isRemoved: {
                inProgress: inProgress,
                error: undefined
            },
        };
    }

    afterActionFinished() {
        const inProgressList = Object.keys(this._syncStatus).filter((k) => (this._syncStatus as any)[k].inProgress === true);
        if (!inProgressList.length) {
            debugger;
            Store2.dispatch(action_set_sync({
                syncDate: new Date().getTime(),
                isSyncing_hidden: false,
                isSyncing_visible: false,
                errorText: undefined
            }));
        }
    }




    /**
     * check if user access updated?
     */
    async isAccessChanged() {
        await CmpUtility.waitOnMe(1000);
        this._syncStatus.isAccessChanged.inProgress = false;
        console.log('isAccessChanged compeleted.');
        this.afterActionFinished();
    }

    /**
     * send all existing books id list, and wait for list of id that is removed.
     */
    async whichBook_isRemoved() {
        await CmpUtility.waitOnMe(1500);
        this._syncStatus.whichBook_isRemoved.inProgress = false;
        console.log('whichBook_isRemoved compeleted.');
        this.afterActionFinished();
    }

    /**
     * send all existing comments id list, and wait for list of id that is removed.
     */
    async whichComment_isRemoved() {
        await CmpUtility.waitOnMe(200);
        this._syncStatus.whichComment_isRemoved.inProgress = false;
        console.log('whichComment_isRemoved compeleted.');
        this.afterActionFinished();
    }

}
