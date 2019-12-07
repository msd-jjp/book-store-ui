import /* workerMsg, */ { IReceiveData } from './fetch-interval.worker';
import { BaseWorker } from '../worker.base';
import { CollectionService } from '../../service/service.collection';
import { LibraryService } from '../../service/service.library';
import { Store2 } from '../../redux/store';
import { action_set_library_data } from '../../redux/action/library';
import { action_set_collections_data } from '../../redux/action/collection';
import { appLocalStorage } from '../../service/appLocalStorage';
import { BaseService } from '../../service/service.base';
import { LoginService } from '../../service/service.login';
import { action_user_logged_in } from '../../redux/action/user';

export class FetchIntervalWorker extends BaseWorker {

    protected _worker: Worker | undefined;
    private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();
    private _loginService = new LoginService();

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
    private start_fetchingData() {
        console.log('--------- fetching library & collection started ---------');
        this.fetchLibrary();
        this.fetchCollection();
        this.fetchProfile();
    }

    private stop_fetchingData() {
        clearTimeout(this.fetchLibrary_timeout);
        clearTimeout(this.fetchCollection_timeout);
        clearTimeout(this.fetchProfile_timeout);
        console.log('--------- fetching library & collection stoped ---------');
    }

    private fetchLibrary_timeout: any;
    private async fetchLibrary() {
        let check;
        if (!BaseService.isAppOffline()) {
            check = await this._libraryService.getAll_check().catch(e => { });
        }
        if (check) {
            const etag_new = check.headers['etag'];
            const eTag_current = appLocalStorage.find_eTagById(LibraryService.generalId);
            if (!eTag_current || eTag_current.eTag !== etag_new) {
                const res = await this._libraryService.getAll().catch(error => { });
                if (res) {
                    appLocalStorage.store_eTag({ id: LibraryService.generalId, eTag: etag_new });
                    Store2.dispatch(action_set_library_data(res.data.result));
                }
            }
        }
        clearTimeout(this.fetchLibrary_timeout);
        this.fetchLibrary_timeout = setTimeout(() => { this.fetchLibrary(); }, this.fetch_timeout_timer);
    }

    private fetchCollection_timeout: any;
    private async fetchCollection() {
        let check;
        if (!BaseService.isAppOffline()) {
            check = await this._collectionService.getAll_check().catch(e => { });
        }
        if (check) {
            const etag_new = check.headers['etag'];
            const eTag_current = appLocalStorage.find_eTagById(CollectionService.generalId);
            if (!eTag_current || eTag_current.eTag !== etag_new) {
                const res = await this._collectionService.getAll().catch(error => { });
                if (res) {
                    appLocalStorage.store_eTag({ id: CollectionService.generalId, eTag: etag_new });
                    Store2.dispatch(action_set_collections_data(res.data.result));
                }
            }
        }
        clearTimeout(this.fetchCollection_timeout);
        this.fetchCollection_timeout = setTimeout(() => { this.fetchCollection(); }, this.fetch_timeout_timer);
    }

    private fetchProfile_timeout: any;
    private async fetchProfile() {
        let check;
        if (!BaseService.isAppOffline()) {
            check = await this._loginService.profile_check().catch(e => { });
        }
        if (check) {
            const etag_new = check.headers['etag'];
            const eTag_current = appLocalStorage.find_eTagById(LoginService.generalId_profile);
            if (!eTag_current || eTag_current.eTag !== etag_new) {
                const res = await this._loginService.profile().catch(error => { });
                if (res) {
                    appLocalStorage.store_eTag({ id: LoginService.generalId_profile, eTag: etag_new });
                    Store2.dispatch(action_user_logged_in(res.data));
                }
            }
        }
        clearTimeout(this.fetchProfile_timeout);
        this.fetchProfile_timeout = setTimeout(() => { this.fetchProfile(); }, this.fetch_timeout_timer);
    }

}
