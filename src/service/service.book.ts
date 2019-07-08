import { BaseService } from './service.base';
import { IBook } from '../model/model.book';

export class BookService extends BaseService {

    search___(data: { title: string }): Promise<{ data: { result: IBook[] } }> {
        return this.axiosTokenInstance.post('/book/_search', data);
    }

    get(bookId: string): Promise<{ data: IBook }> {
        return this.axiosTokenInstance.get(`/books/${bookId}`);
    }

    bookByWriter(data: { book_id: string, person_id: string }): Promise<{ data: { result: IBook[] } }> {
        return this.axiosTokenInstance.post(`/books/recommended`, data);
    }

    recomended(data: { search_key: string } = { search_key: "Drama" }): Promise<{ data: { result: IBook[] } }> {
        return this.axiosTokenInstance.post(`/books/_search`, data);
    }

    newest(): Promise<{ data: { result: IBook[] } }> {
        return this.axiosTokenInstance.get(`/books/newest`);
    }

}
