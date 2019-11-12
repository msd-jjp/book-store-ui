import { BaseService, IAPI_ResponseList, IAPI_Response } from './service.base';
import { ILibrary } from '../model/model.library';

export class LibraryService extends BaseService {

    getAll(): Promise<IAPI_ResponseList<ILibrary>> {
        if (BaseService.isAppOffline()) {
            return new Promise((resolve, reject) => {
                reject({ error: 'no internet access' });
            });
        }
        // return this.axiosTokenInstance.get('/library');
        return this.axiosTokenInstance.post('/library/user', {});
    }

    checkChange(): Promise<IAPI_ResponseList<any>> { // todo return ?
        return this.axiosTokenInstance.head('/library');
    }

    // update_status(
    update_progress(
        library_id: ILibrary['id'],
        // status: { status?: string; reading_started?: boolean; read_pages?: number; read_duration?: number; }, // ILibrary['status']
        progress: ILibrary['progress']
    ): Promise<IAPI_Response<ILibrary>> {
        // return this.axiosTokenInstance.put(`/library/${library_id}`, { status, progress });
        return this.axiosTokenInstance.put(`/library/${library_id}`, { progress });
    }

}
