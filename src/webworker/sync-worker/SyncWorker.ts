import /* workerMsg, */ { IReceiveData } from './sync.worker';
import { BaseWorker } from '../worker.base';
import { CollectionService } from '../../service/service.collection';
import { LibraryService } from '../../service/service.library';
// import { IToken } from '../../model/model.token';
import { Store2 } from '../../redux/store';
import { action_set_sync } from '../../redux/action/sync';

import { CmpUtility } from '../../component/_base/CmpUtility';
import { AxiosError } from 'axios';
import { OrderService } from '../../service/service.order';
import { PersonService } from '../../service/service.person';
interface ISyncStatusItem {
    inProgress: boolean;
    error: AxiosError | undefined;
}

interface ISyncStatus {
    isAccessChanged: ISyncStatusItem;
    whichBook_isRemoved: ISyncStatusItem;
    whichComment_isRemoved: ISyncStatusItem;
    userCurrentBook: ISyncStatusItem;
}


export class SyncWorker extends BaseWorker {

    protected _worker: Worker | undefined;
    private _syncStatus!: ISyncStatus;
    private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();
    private _orderService = new OrderService();
    private _personService = new PersonService();

    constructor(/* token: IToken */) {
        super();
        // this._libraryService.setToken(token);
        // this._collectionService.setToken(token);
        // this.init();

        this.reset_syncStatus(/* false */);
    }

    protected init() {
        // if (typeof (Worker) !== "undefined") {
        //     this._worker = new (workerMsg as any)();
        // }
    }

    postMessage(data: IReceiveData) {
        if (data === "start") {
            // this.startSyncing(data === "start_visible");

            if (!Store2.getState().sync.isSyncing_hidden) {
                this.startSyncing();
            }
        } else if (data === "start_visible") {
            if (!Store2.getState().sync.isSyncing_hidden) {
                this.startSyncing(true);
            } else {
                Store2.dispatch(action_set_sync({
                    ...Store2.getState().sync,
                    isSyncing_visible: true,
                }));
            }
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
        this.reset_syncStatus();

        Store2.dispatch(action_set_sync({
            ...Store2.getState().sync,
            isSyncing_hidden: true,
            isSyncing_visible: visible,
            errorList: []
        }));

        this.isAccessChanged();
        this.whichBook_isRemoved();
        this.whichComment_isRemoved();
        this.userCurrentBook();
    }

    private reset_syncStatus(/* inProgress: boolean */) {
        this._syncStatus = {
            isAccessChanged: {
                inProgress: false, // inProgress,
                error: undefined
            },
            whichBook_isRemoved: {
                inProgress: false, // inProgress,
                error: undefined
            },
            whichComment_isRemoved: {
                inProgress: false, // inProgress,
                error: undefined
            },
            userCurrentBook: {
                inProgress: false,
                error: undefined
            },
        };
    }

    private afterActionFinished() {
        const inProgressList = Object.keys(this._syncStatus).filter((k) => (this._syncStatus as any)[k].inProgress === true);
        if (!inProgressList.length) {
            const errorList_key = Object.keys(this._syncStatus).filter((k) => (this._syncStatus as any)[k].error !== undefined);
            const errorList = errorList_key.map(k => (this._syncStatus as any)[k].error);
            // debugger;
            if (errorList.length) {
                // debugger;
                // const _errorList: any = errorList;
                Store2.dispatch(action_set_sync({
                    // syncDate: new Date().getTime(),
                    ...Store2.getState().sync,
                    isSyncing_hidden: false,
                    isSyncing_visible: false,
                    errorList: errorList
                }));
            } else {
                Store2.dispatch(action_set_sync({
                    syncDate: new Date().getTime(),
                    isSyncing_hidden: false,
                    isSyncing_visible: false,
                    errorList: []
                }));
            }
        }
    }




    /**
     * check if user access updated?
     */
    private async isAccessChanged() {
        this._syncStatus.isAccessChanged.inProgress = true;
        this._syncStatus.isAccessChanged.error = undefined;
        // await CmpUtility.waitOnMe(1000);
        await this._collectionService.getAll().catch((e: AxiosError) => { // _libraryService
            this._syncStatus.isAccessChanged.error = e;
        });
        this._syncStatus.isAccessChanged.inProgress = false;
        // this._syncStatus.isAccessChanged.error = undefined;
        // console.log('isAccessChanged compeleted.');
        this.afterActionFinished();
    }

    /**
     * send all existing books id list, and wait for list of id that is removed.
     */
    private async whichBook_isRemoved() {
        this._syncStatus.whichBook_isRemoved.inProgress = true;
        this._syncStatus.whichBook_isRemoved.error = undefined;
        // await CmpUtility.waitOnMe(1500);
        await this._orderService.search_userOrder(10, 0).catch((e: AxiosError) => {
            this._syncStatus.whichBook_isRemoved.error = e;
        });
        this._syncStatus.whichBook_isRemoved.inProgress = false;
        // console.log('whichBook_isRemoved compeleted.');
        this.afterActionFinished();
    }

    /**
     * send all existing comments id list, and wait for list of id that is removed.
     */
    private async whichComment_isRemoved() {
        this._syncStatus.whichComment_isRemoved.inProgress = true;
        await CmpUtility.waitOnMe(200);
        this._syncStatus.whichComment_isRemoved.inProgress = false;
        this._syncStatus.whichComment_isRemoved.error = undefined;
        console.log('whichComment_isRemoved compeleted.');
        this.afterActionFinished();
    }

    // todo: get user here & update user
    /**
     * check if "device current book" is different from "server current book".
     */
    private async userCurrentBook() {
        this._syncStatus.userCurrentBook.inProgress = true;
        this._syncStatus.userCurrentBook.error = undefined;
        
        const logged_in_user = Store2.getState().logged_in_user;
        if (!logged_in_user!.person.current_book || !logged_in_user!.person.current_book.id) {
            this._syncStatus.userCurrentBook.inProgress = false;
            return;
        }
        await this._personService.update(
            { current_book_id: logged_in_user!.person.current_book.id },
            logged_in_user!.person.id
        ).catch((e: AxiosError) => {
            this._syncStatus.userCurrentBook.error = e;
        });
        this._syncStatus.userCurrentBook.inProgress = false;
        this.afterActionFinished();
    }

}
