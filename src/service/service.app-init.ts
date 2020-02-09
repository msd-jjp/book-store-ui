import { BaseService } from './service.base';
// import { appLocalStorage } from './appLocalStorage';

export class AppInitService extends BaseService {

    constructor() {
        super();
        this.init();
    }

    init() {
        // console.log('app init service 1');
        let newVersion = process.env.REACT_APP_VERSION || '';
        let oldVersion = localStorage.getItem('app-version') || '';
        this.onUpgrade(oldVersion, newVersion);
        localStorage.setItem('app-version', newVersion);
    }

    private onUpgrade(appOldVersion: string, appNewVersion: string) {
        if (appOldVersion && appNewVersion && (appOldVersion !== appNewVersion)) {
            debugger;
            console.log('update if you want, app version: ' + appNewVersion);
            // this._resetDB();

        }
    }

    // _resetDB() {
    //     appLocalStorage.resetDB();
    // }

    // clearAllComments_fromDB() {
    //     appLocalStorage.clearCollection('clc_comment');
    // }

}
