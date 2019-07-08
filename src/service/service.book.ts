import { BaseService, IAPI_ResponseList, IAPI_Response } from './service.base';
import { IBook } from '../model/model.book';

export class BookService extends BaseService {

    search___(data: { title: string }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post('/book/_search', data);
    }

    get(bookId: string): Promise<IAPI_Response<IBook>> {
        return this.axiosTokenInstance.get(`/books/${bookId}`);
    }

    bookByWriter(data: { book_id: string, person_id: string }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post(`/books/recommended`, data);
    }

    recomended(data: { search_key: string } = { search_key: "Drama" }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post(`/books/_search`, data);
    }

    newest(): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.get(`/books/newest`);
    }

}
