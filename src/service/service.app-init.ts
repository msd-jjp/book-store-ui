import { BaseService } from './service.base';

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
            console.log('update if you want...');
        }
    }

}
