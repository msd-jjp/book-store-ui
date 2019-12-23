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
import { Utility } from '../../asset/script/utility';
import { DeviceKeyService } from '../../service/service.device-key';
import { action_update_device_Key } from '../../redux/action/device-key';

export class FetchIntervalWorker extends BaseWorker {

    protected _worker: Worker | undefined;
    private _libraryService = new LibraryService();
    private _collectionService = new CollectionService();
    private _loginService = new LoginService();
    private _deviceKeyService = new DeviceKeyService();

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

    private readonly general_timeout_timer: number = 30; // in second
    private interval_inProgress = false;
    private async start_fetchingData() {
        console.log('--------- fetching library & collection started ---------');
        this.interval_inProgress = true;
        this.fetchLibrary();
        await Utility.waitOnMe(1000);
        this.fetchCollection();
        await Utility.waitOnMe(1000);
        this.fetchProfile();
        await Utility.waitOnMe(1000);
        this.checkDeviceKey();
    }

    private stop_fetchingData() {
        this.interval_inProgress = false;
        clearTimeout(this.fetchLibrary_timeout);
        clearTimeout(this.fetchCollection_timeout);
        clearTimeout(this.fetchProfile_timeout);
        clearTimeout(this.checkDeviceKey_timeout);
        console.log('--------- fetching library & collection stoped ---------');
    }

    private randomTime(timer: number = this.general_timeout_timer): number {
        return (timer * 1000) + (Utility.random_int(1, 10) * 1000);
    }

    private fetchLibrary_timeout: any;
    private async fetchLibrary() {
        if (!this.interval_inProgress) return;
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
        this.fetchLibrary_timeout = setTimeout(() => { this.fetchLibrary(); }, this.randomTime());
    }

    private fetchCollection_timeout: any;
    private async fetchCollection() {
        if (!this.interval_inProgress) return;
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
        this.fetchCollection_timeout = setTimeout(() => { this.fetchCollection(); }, this.randomTime());
    }

    private fetchProfile_timeout: any;
    private async fetchProfile() {
        if (!this.interval_inProgress) return;
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
        this.fetchProfile_timeout = setTimeout(() => { this.fetchProfile(); }, this.randomTime());
    }

    private checkDeviceKey_timeout: any;
    private async checkDeviceKey() {
        if (!this.interval_inProgress) return;
        if (!BaseService.isAppOffline()) {
            let _deviceKey_id;
            const _deviceKey = Store2.getState().device_key.deviceKey;
            if (_deviceKey !== undefined) {
                _deviceKey_id = _deviceKey.id;
                await this._deviceKeyService.getById(_deviceKey_id).catch(e => {
                    if (e.response && e.response.status === 404) {
                        debugger;
                        // this.onApplogout(this.props.history, false);
                        const _device_key = { ...Store2.getState().device_key };
                        _device_key.notExistInServer = true;
                        Store2.dispatch(action_update_device_Key(_device_key));
                    }
                });
            }
        }
        clearTimeout(this.checkDeviceKey_timeout);
        this.checkDeviceKey_timeout = setTimeout(() => { this.checkDeviceKey(); }, this.randomTime(60));
    }

}
