import { LibraryService } from "../../service/service.library";
// import { CollectionService } from "../../service/service.collection";
// import { IToken } from "../../model/model.token";
import { Store2 } from "../../redux/store";
import { action_set_library_data } from "../../redux/action/library";

export interface IReceiveData {
    type: 'start' | 'stop';
    // token?: IToken;
    // _libraryService?: LibraryService
}

export interface ISendData {
    type: 'changed';
}

export interface IReceiveMessageEvent extends MessageEvent {
    data: IReceiveData;
}

export interface ISendMessageEvent extends MessageEvent {
    data: ISendData;
}

export default onmessage = async function (e: IReceiveMessageEvent) {
    if (!e.data) return;
    let _fetchData: FetchData | undefined;

    debugger;

    // if (e.data.type === 'start' && e.data._libraryService) {
    //     _fetchData = new FetchData(/* e.data.token */e.data._libraryService);
    //     _fetchData.start_fetchingData();
    // }

    // if (e.data.type === 'stop') {
    //     _fetchData && _fetchData.stop_fetchingData();
    // }

    // postMessage({  });
}


class FetchData {
    // private _libraryService = new LibraryService();
    // private _collectionService = new CollectionService();
    // private _libraryService:LibraryService|undefined;

    // constructor(token: IToken) {
    //     // this._libraryService.setToken(token);
    //     // this._collectionService.setToken(token);
    // }
    constructor(private _libraryService: LibraryService) {
        // this._libraryService = _libraryService
        // this._libraryService.setToken(token);
        // this._collectionService.setToken(token);
    }

    private fetch_timeout_timer: number = 30000; // in ms --> 30second
    start_fetchingData() {
        this.fetchLibrary();
        // this.fetchCollection();
    }

    stop_fetchingData() {
        clearTimeout(this.fetchLibrary_timeout);
        // clearTimeout(this.fetchCollection_timeout);
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

}
