import { BaseService, IAPI_Response, IAPI_ResponseList } from './service.base';
import { IBook } from '../model/model.book';

export interface ILibrary {
    id: string;
    book: IBook;
    status: {
        status: string; // "buyed",
        reading_started: boolean;
        read_pages: number;
        read_duration: number;
    },
}

export class LibraryService extends BaseService {

    getAll(): Promise<IAPI_ResponseList<ILibrary>> {
        return this.axiosTokenInstance.get('/library');
    }

    checkChange(): Promise<IAPI_ResponseList<any>> { // todo return ?
        return this.axiosTokenInstance.head('/library');
    }

}
