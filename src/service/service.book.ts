import { BaseService } from './service.base';
import { IBook } from '../model/model.book';

export class BookService extends BaseService {

    search(data: { title: string }): Promise<any> {
        return this.axiosTokenInstance.post('/book/search', data);
    }

    get(bookId: string): Promise<any> {
        return this.axiosTokenInstance.post(`/book/${bookId}`);
    }

    bookByWriter(data: { book_id: string, person_id: string }): Promise<IBook[]> {
        return this.axiosTokenInstance.post(`/books/recommended`, data);
    }

    recomended(data: { search_key: string } = { search_key: "Drama" }): Promise<IBook[]> {
        return this.axiosTokenInstance.post(`/books/_search`, data);
    }
    
    newest(): Promise<IBook[]> {
        return this.axiosTokenInstance.get(`/books/newest`);
    }

}
