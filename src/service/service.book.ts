import { BaseService, IAPI_ResponseList, IAPI_Response } from './service.base';
import { IBook } from '../model/model.book';
import { appLocalStorage } from './appLocalStorage';

export class BookService extends BaseService {

    get(bookId: string): Promise<IAPI_Response<IBook>> {
        if (BaseService.isAppOffline()) {
            let lcl_book: IBook | null = appLocalStorage.findById('clc_book', bookId);
            if (lcl_book) {
                return new Promise((resolve, reject) => {
                    resolve({ data: lcl_book! });
                });
            } else {
                //reject: put if else into Promise
            }
        }

        return this.axiosTokenInstance.get(`/books/${bookId}`);
    }

    bookByWriter(data: { book_id: string, writer: string }): Promise<IAPI_ResponseList<IBook>> { // writer || person_id
        return this.search({ limit: 10, offset: 0, filter: data });
    }

    recomended(): Promise<IAPI_ResponseList<IBook>> {
        return this.search({ limit: 10, offset: 0, filter: { genre: 'Romance' } });
    }

    newest(): Promise<IAPI_ResponseList<IBook>> {
        return this.search({ limit: 10, offset: 0, filter: { tag: 'new' } });
    }

    search(data: { limit: number, offset: number, filter: Object }): Promise<IAPI_ResponseList<IBook>> {
        if (BaseService.isAppOffline()) {
            let lcl_book_list: IBook[] | null = appLocalStorage.search_by_query_book(data);
            lcl_book_list = lcl_book_list || [];
            if (lcl_book_list /* && lcl_book_list.length */) {
                return new Promise((resolve, reject) => {
                    resolve({ data: { result: lcl_book_list! } });
                });
            }
        }
        return this.axiosTokenInstance.post('/books/_search', data);
    }

    search_phrase(data: { limit: number, offset: number, filter: { search_phrase: string } }): Promise<IAPI_ResponseList<IBook>> {
        if (BaseService.isAppOffline()) {
            let lcl_book_list: IBook[] | null = appLocalStorage.search_by_phrase_book(data);
            lcl_book_list = lcl_book_list || [];
            if (lcl_book_list /* && lcl_book_list.length */) {
                return new Promise((resolve, reject) => {
                    resolve({ data: { result: lcl_book_list! } });
                });
            }
        }
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

    wishList_search(data: { limit: number, offset: number }): Promise<IAPI_ResponseList<IBook>> {
        return this.axiosTokenInstance.post('/wish-list/_search', data);
    }

}
