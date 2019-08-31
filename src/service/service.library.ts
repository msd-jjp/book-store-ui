import { BaseService, IAPI_ResponseList } from './service.base';
import { ILibrary } from '../model/model.library';

export class LibraryService extends BaseService {

    getAll(): Promise<IAPI_ResponseList<ILibrary>> {
        return this.axiosTokenInstance.get('/library');
    }

    checkChange(): Promise<IAPI_ResponseList<any>> { // todo return ?
        return this.axiosTokenInstance.head('/library');
    }

}
