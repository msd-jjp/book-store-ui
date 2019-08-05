import { BaseService } from './service.base';
// import { appLocalStorage } from './appLocalStorage';

export class AppInitService extends BaseService {

    constructor() {
        super();
        this.init()
    }

    init() {
        let newVersion = process.env.REACT_APP_VERSION || '';
        let oldVersion = localStorage.getItem('app-version') || '';
        this.reInit_onUpdate(oldVersion, newVersion);
        localStorage.setItem('app-version', newVersion);
    }

    reInit_onUpdate(appOldVersion: string, appNewVersion: string) {
        if (appOldVersion && appNewVersion && (appOldVersion !== appNewVersion)) {
            debugger;
            console.log('update if you want 5...');
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
