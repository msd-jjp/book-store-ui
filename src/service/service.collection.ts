import { BaseService, IAPI_Response, IAPI_ResponseList } from './service.base';
import { IBook } from '../model/model.book';
import { ICollection } from '../model/model.collection';
import { AxiosResponse } from 'axios';

export class CollectionService extends BaseService {
    
    static generalId = 'user-collection-id';

    search(data: { limit: number, skip: number, filter: Object }): Promise<IAPI_ResponseList<{
        book: IBook,
        title: string;
        id: string;
        person_id: string;
    }>> {
        return this.axiosTokenInstance.post('/collections/_search', data);
    }

    getAll(): Promise<IAPI_ResponseList<ICollection>> {
        if (BaseService.isAppOffline()) {
            return new Promise((resolve, reject) => {
                reject({ error: 'no internet access' });
            });
        }
        return this.axiosTokenInstance.post('/collections/user', {});
    }

    getAll_check(): Promise<AxiosResponse<{}>> {
        return this.axiosTokenInstance.head('/collections/user');
    }

    get_byTitle(title: string): Promise<IAPI_Response<IBook>> {
        return this.axiosTokenInstance.post(`/collections/collection`, { title });
    }

    rename(currentTitle: string, newTitle: string): Promise<IAPI_ResponseList<any>> {
        return this.axiosTokenInstance.put(`/collections`, { title: currentTitle, new_title: newTitle });
    }
    // get_byId(id: string): Promise<IAPI_Response<IBook>> {
    //     return this.axiosTokenInstance.get(`/collections/${id}`);
    // }
    create(title: string, book_ids?: string[]): Promise<IAPI_Response<{ title: string, [key: string]: any }>> { // todo
        return this.axiosTokenInstance.post('/collections', {
            book_ids,
            title
        });
    }
    // add(title: string, book_ids: string[]) {
    //     return this.create(title, book_ids);
    // }
    add_toCollections(collections_title: string[], book_ids: string[]) {
        return this.axiosTokenInstance.post('/collections/book', {
            book_ids,
            collections: collections_title
        });
    }
    remove(title: string) {
        return this.axiosTokenInstance.delete(`/collections/collection`, { data: { title } });
    }
    remove_byId(id: string) { // admin
        return this.axiosTokenInstance.delete(`/collections/${id}`);
    }
    remove_books(title: string, book_ids: string[]) {
        return this.axiosTokenInstance.delete(`/collections/remove-books`, { data: { title, book_ids } });
    }

}
