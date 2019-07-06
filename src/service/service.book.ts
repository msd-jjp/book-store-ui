import { BaseService } from './service.base';

export class BookService extends BaseService {

    search(data: { title: string }): Promise<any> {
        return this.axiosInstance.post('/book/search', data);
    }
    
    get(bookId: string ): Promise<any> {
        return this.axiosInstance.post(`/book/${bookId}`);
    }

}
