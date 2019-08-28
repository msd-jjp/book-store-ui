import { BaseService, IAPI_Response, IAPI_ResponseList } from './service.base';
import { IBook } from '../model/model.book';

export interface ICollection {
    books: IBook[];
    title: string;
}

export class CollectionService extends BaseService {

    search(data: { limit: number, offset: number, filter: Object }): Promise<IAPI_ResponseList<{
        book: IBook,
        title: string;
        id: string;
        person_id: string;
    }>> {
        return this.axiosTokenInstance.post('/collections/_search', data);
    }
    getAll(): Promise<IAPI_ResponseList<ICollection>> {
        return this.axiosTokenInstance.get('/collections');
    }
    get_byTitle(title: string): Promise<IAPI_Response<IBook>> {
        return this.axiosTokenInstance.get(`/collections/title/${title}`);
    }
    // get_byId(id: string): Promise<IAPI_Response<IBook>> {
    //     return this.axiosTokenInstance.get(`/collections/${id}`);
    // }
    create(title: string, book_ids?: string[]): Promise<IAPI_Response<{title:string, [key: string]: any}>> { // todo
        return this.axiosTokenInstance.post('/collections', {
            book_ids,
            title
        });
    }
    add(title: string, book_ids: string[]) {
        return this.create(title, book_ids);
    }
    add_toCollections(collections_title: string[], book_id: string) {
        return this.axiosTokenInstance.post('/collections/book', {
            book_id,
            collections: collections_title
        });
    }
    remove(title: string) {
        return this.axiosTokenInstance.delete(`/collections/${title}`);
    }
    remove_byId(id: string) { // admin
        return this.axiosTokenInstance.delete(`/collections/${id}`);
    }
    remove_books(title: string, book_ids: string[]) {
        return this.axiosTokenInstance.delete(`/collections/remove-books`, { data: { title, book_ids } });
    }

}
