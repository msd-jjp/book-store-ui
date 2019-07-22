import { BaseService, IAPI_ResponseList, IAPI_Response } from './service.base';
import { IBook } from '../model/model.book';

export class BookService extends BaseService {

    search___(data: { title: string }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post('/book/_search', data);
    }

    get(bookId: string): Promise<IAPI_Response<IBook>> {
        return this.axiosTokenInstance.get(`/books/${bookId}`);
    }

    /* bookByWriter(data: { book_id: string, person_id: string }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post(`/books/recommended`, data);
    } */

    bookByWriter(data: { book_id: string, writer: string }): Promise<IAPI_ResponseList<IBook>> {
        return this.search({ limit: 10, offset: 0, filter: data });
    }

    /* recomended(data: { search_key: string } = { search_key: "Drama" }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post(`/books/_search`, data);
    } */
    recomended(): Promise<IAPI_ResponseList<IBook>> {
        return this.search({ limit: 10, offset: 0, filter: { genre: 'Romance' } });
    }

    /* newest__(): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.get(`/books/newest`);
    } */
    newest(): Promise<IAPI_ResponseList<IBook>> {
        return this.search({ limit: 10, offset: 0, filter: { tag: 'new' } });
    }

    search(data: { limit: number, offset: number, filter: Object }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post('/books/_search', data);
    }

    search_phrase(data: { limit: number, offset: number, filter: { search_phrase: string } }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosInstance.post('/books/search-phrase', data); // axiosTokenInstance
    }

    wishList_add_book(book_id: string): Promise<any> {
        return this.axiosTokenInstance.post('/wish-list', { books: [book_id] });
    }

    wishList_remove_book(book_id: string): Promise<any> {
        return this.axiosTokenInstance.delete(`/wish-list/remove-books`, { data: { books: [book_id] } });
    }

    wishList_clear(): Promise<any> {
        return this.axiosTokenInstance.delete(`/wish-list`);
    }

}
