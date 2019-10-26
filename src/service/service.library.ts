import { BaseService, IAPI_ResponseList } from './service.base';
import { ILibrary } from '../model/model.library';

export class LibraryService extends BaseService {

    getAll(): Promise<IAPI_ResponseList<ILibrary>> {
        if (BaseService.isAppOffline()) {
            return new Promise((resolve, reject) => {
                reject({ error: 'no internet access' });
            });
        }
        return this.axiosTokenInstance.get('/library');
    }

    checkChange(): Promise<IAPI_ResponseList<any>> { // todo return ?
        return this.axiosTokenInstance.head('/library');
    }

    update_status(library_id: ILibrary['id'], status: {
        status?: string;
        reading_started?: boolean;
        read_pages?: number;
        read_duration?: number;
    }) { // ILibrary['status']
        // return this.axiosTokenInstance.get('/library');
        return this.axiosTokenInstance.put(`/library/${library_id}`, { status });
    }

}
